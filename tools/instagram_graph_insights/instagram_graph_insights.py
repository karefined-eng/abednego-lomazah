#!/usr/bin/env python3
"""Extract Instagram professional-account media insights.

The script uses only supported Graph API endpoints and never logs access tokens.
It requests media insights one metric at a time so an unsupported metric for one
media type does not prevent other metrics from being collected.
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urljoin

import requests

DEFAULT_API_VERSION = os.getenv("IG_API_VERSION", "v26.0")
DEFAULT_HOST = os.getenv("IG_GRAPH_HOST", "https://graph.instagram.com").rstrip("/")
DEFAULT_MEDIA_FIELDS = ",".join(
    [
        "id",
        "caption",
        "media_type",
        "media_product_type",
        "timestamp",
        "permalink",
        "like_count",
        "comments_count",
        "media_url",
        "thumbnail_url",
    ]
)

# This is intentionally broad. Availability depends on media type, API version,
# permissions, login flow, and account state. Unsupported metrics are recorded as
# per-metric errors rather than stopping the entire extraction.
DEFAULT_METRICS = [
    "comments",
    "likes",
    "saved",
    "shares",
    "total_interactions",
    "reach",
    "views",
    "follows",
    "profile_activity",
    "profile_visits",
    "link_clicks",
    "navigation",
    "replies",
    "reposts",
    "crossposted_views",
    "facebook_views",
    "ig_reels_avg_watch_time",
    "ig_reels_video_view_total_time",
    "reels_skip_rate",
    "total_comments",
    "total_likes",
    "total_views",
]

RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


class GraphAPIError(RuntimeError):
    """An API error with enough context to diagnose without exposing secrets."""

    def __init__(self, message: str, *, status_code: int | None = None, payload: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


@dataclass
class MetricResult:
    metric: str
    value: Any = None
    period: str | None = None
    error: str | None = None
    status_code: int | None = None


@dataclass
class PostRecord:
    id: str
    timestamp: str | None = None
    media_type: str | None = None
    media_product_type: str | None = None
    permalink: str | None = None
    caption: str | None = None
    like_count: int | None = None
    comments_count: int | None = None
    media_url: str | None = None
    thumbnail_url: str | None = None
    insights: dict[str, Any] = field(default_factory=dict)
    insight_errors: list[dict[str, Any]] = field(default_factory=list)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract Instagram media metadata and granular per-post insights."
    )
    parser.add_argument("--user-id", default=os.getenv("IG_USER_ID"), help="Instagram professional-account ID (or IG_USER_ID).")
    parser.add_argument("--access-token", default=os.getenv("IG_ACCESS_TOKEN"), help="Access token (prefer IG_ACCESS_TOKEN; never commit it).")
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"Graph host, default: {DEFAULT_HOST}")
    parser.add_argument("--api-version", default=DEFAULT_API_VERSION, help=f"Graph API version, default: {DEFAULT_API_VERSION}")
    parser.add_argument("--output-dir", default="instagram_insights_output", help="Directory for JSON and CSV outputs.")
    parser.add_argument("--max-posts", type=int, default=0, help="Maximum posts to fetch; 0 means follow pagination until exhausted.")
    parser.add_argument("--page-size", type=int, default=100, help="Media page size requested from the API.")
    parser.add_argument("--period", default="lifetime", help="Media insight period, usually lifetime for posts/Reels.")
    parser.add_argument(
        "--metrics",
        default=",".join(DEFAULT_METRICS),
        help="Comma-separated metrics. Metrics are requested individually for resilience.",
    )
    parser.add_argument("--timeout", type=float, default=30.0, help="HTTP timeout in seconds.")
    parser.add_argument("--retries", type=int, default=3, help="Retries for 429/5xx responses.")
    parser.add_argument("--log-level", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"])
    return parser.parse_args(argv)


def require_credentials(args: argparse.Namespace) -> None:
    missing = []
    if not args.user_id:
        missing.append("IG_USER_ID or --user-id")
    if not args.access_token:
        missing.append("IG_ACCESS_TOKEN or --access-token")
    if missing:
        raise SystemExit("Missing required configuration: " + ", ".join(missing))


def api_url(host: str, api_version: str, path: str) -> str:
    return f"{host.rstrip('/')}/{api_version.strip('/')}/{path.lstrip('/')}"


def safe_error_payload(response: requests.Response) -> Any:
    try:
        payload = response.json()
    except ValueError:
        return response.text[:1000]
    if isinstance(payload, dict):
        # Preserve useful Graph API error diagnostics while excluding anything
        # that could accidentally contain credentials.
        error = payload.get("error")
        if isinstance(error, dict):
            return {
                "message": error.get("message"),
                "type": error.get("type"),
                "code": error.get("code"),
                "error_subcode": error.get("error_subcode"),
                "fbtrace_id": error.get("fbtrace_id"),
            }
    return payload


def get_json(
    session: requests.Session,
    url: str,
    *,
    token: str,
    params: dict[str, Any] | None = None,
    timeout: float,
    retries: int,
) -> dict[str, Any]:
    query = dict(params or {})
    query["access_token"] = token
    last_error: GraphAPIError | None = None
    for attempt in range(retries + 1):
        try:
            response = session.get(url, params=query, timeout=timeout)
        except requests.RequestException as exc:
            last_error = GraphAPIError(f"Network error: {exc}")
            if attempt >= retries:
                raise last_error
            time.sleep(2**attempt)
            continue
        if response.status_code in RETRYABLE_STATUS_CODES and attempt < retries:
            retry_after = response.headers.get("Retry-After")
            delay = float(retry_after) if retry_after and retry_after.replace('.', '', 1).isdigit() else 2**attempt
            time.sleep(min(delay, 30.0))
            continue
        if response.status_code >= 400:
            raise GraphAPIError(
                f"Graph API request failed with HTTP {response.status_code}",
                status_code=response.status_code,
                payload=safe_error_payload(response),
            )
        try:
            payload = response.json()
        except ValueError as exc:
            raise GraphAPIError("Graph API returned non-JSON content", status_code=response.status_code) from exc
        if not isinstance(payload, dict):
            raise GraphAPIError("Graph API returned an unexpected JSON shape", status_code=response.status_code, payload=payload)
        return payload
    raise last_error or GraphAPIError("Graph API request failed after retries")


def fetch_media(
    session: requests.Session,
    *,
    user_id: str,
    host: str,
    api_version: str,
    token: str,
    fields: str,
    page_size: int,
    max_posts: int,
    timeout: float,
    retries: int,
) -> list[dict[str, Any]]:
    url = api_url(host, api_version, f"{user_id}/media")
    params: dict[str, Any] = {"fields": fields, "limit": page_size}
    media: list[dict[str, Any]] = []
    while url:
        payload = get_json(session, url, token=token, params=params, timeout=timeout, retries=retries)
        page = payload.get("data", [])
        if not isinstance(page, list):
            raise GraphAPIError("Media response did not contain a data array", payload=payload)
        media.extend(item for item in page if isinstance(item, dict))
        if max_posts and len(media) >= max_posts:
            return media[:max_posts]
        next_url = payload.get("paging", {}).get("next") if isinstance(payload.get("paging"), dict) else None
        if not next_url:
            break
        url = next_url
        # The paging URL already contains its query string, including its cursor.
        params = {}
    return media


def extract_metric_value(item: dict[str, Any]) -> tuple[Any, str | None]:
    values = item.get("values")
    if isinstance(values, list) and values:
        first = values[0]
        if isinstance(first, dict) and "value" in first:
            return first["value"], item.get("period")
    if "value" in item:
        return item["value"], item.get("period")
    return None, item.get("period")


def fetch_one_metric(
    session: requests.Session,
    *,
    media_id: str,
    metric: str,
    period: str,
    host: str,
    api_version: str,
    token: str,
    timeout: float,
    retries: int,
) -> MetricResult:
    url = api_url(host, api_version, f"{media_id}/insights")
    try:
        payload = get_json(
            session,
            url,
            token=token,
            params={"metric": metric, "period": period},
            timeout=timeout,
            retries=retries,
        )
        data = payload.get("data", [])
        if not isinstance(data, list) or not data:
            return MetricResult(metric=metric, period=period, error="empty_data")
        for item in data:
            if isinstance(item, dict) and item.get("name", metric) == metric:
                value, returned_period = extract_metric_value(item)
                return MetricResult(metric=metric, value=value, period=returned_period or period)
        return MetricResult(metric=metric, period=period, error="metric_not_returned")
    except GraphAPIError as exc:
        return MetricResult(
            metric=metric,
            period=period,
            error=str(exc) if exc.payload is None else json.dumps(exc.payload, ensure_ascii=False),
            status_code=exc.status_code,
        )


def build_record(media: dict[str, Any], metric_results: Iterable[MetricResult]) -> PostRecord:
    record = PostRecord(
        id=str(media.get("id", "")),
        timestamp=media.get("timestamp"),
        media_type=media.get("media_type"),
        media_product_type=media.get("media_product_type"),
        permalink=media.get("permalink"),
        caption=media.get("caption"),
        like_count=media.get("like_count"),
        comments_count=media.get("comments_count"),
        media_url=media.get("media_url"),
        thumbnail_url=media.get("thumbnail_url"),
    )
    for result in metric_results:
        if result.error is None:
            record.insights[result.metric] = {"value": result.value, "period": result.period}
        else:
            record.insight_errors.append(asdict(result))
    return record


def write_outputs(records: list[PostRecord], output_dir: Path, *, metadata: dict[str, Any]) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "instagram_post_insights.json"
    csv_path = output_dir / "instagram_post_insights.csv"
    json_payload = {
        "extracted_at": datetime.now(timezone.utc).isoformat(),
        "metadata": metadata,
        "posts": [asdict(record) for record in records],
    }
    json_path.write_text(json.dumps(json_payload, indent=2, ensure_ascii=False), encoding="utf-8")

    metric_names = sorted({metric for record in records for metric in record.insights})
    columns = [
        "id",
        "timestamp",
        "media_type",
        "media_product_type",
        "permalink",
        "caption",
        "like_count",
        "comments_count",
        *metric_names,
        "insight_error_count",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for record in records:
            row = {
                "id": record.id,
                "timestamp": record.timestamp,
                "media_type": record.media_type,
                "media_product_type": record.media_product_type,
                "permalink": record.permalink,
                "caption": record.caption,
                "like_count": record.like_count,
                "comments_count": record.comments_count,
                "insight_error_count": len(record.insight_errors),
            }
            row.update({metric: record.insights[metric]["value"] for metric in record.insights})
            writer.writerow(row)
    return json_path, csv_path


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(level=getattr(logging, args.log_level), format="%(levelname)s %(message)s")
    require_credentials(args)
    metrics = [metric.strip() for metric in args.metrics.split(",") if metric.strip()]
    session = requests.Session()
    session.headers.update({"User-Agent": "instagram-graph-insights-extractor/1.0"})
    logging.info("Fetching media for account %s", args.user_id)
    media = fetch_media(
        session,
        user_id=args.user_id,
        host=args.host,
        api_version=args.api_version,
        token=args.access_token,
        fields=DEFAULT_MEDIA_FIELDS,
        page_size=args.page_size,
        max_posts=args.max_posts,
        timeout=args.timeout,
        retries=args.retries,
    )
    logging.info("Fetched %d media objects; requesting %d metrics per object", len(media), len(metrics))
    records: list[PostRecord] = []
    for index, item in enumerate(media, start=1):
        media_id = str(item.get("id", ""))
        if not media_id:
            logging.warning("Skipping media object without an id")
            continue
        logging.info("[%d/%d] %s", index, len(media), media_id)
        results = []
        for metric in metrics:
            result = fetch_one_metric(
                session,
                media_id=media_id,
                metric=metric,
                period=args.period,
                host=args.host,
                api_version=args.api_version,
                token=args.access_token,
                timeout=args.timeout,
                retries=args.retries,
            )
            results.append(result)
        records.append(build_record(item, results))

    metadata = {
        "user_id": args.user_id,
        "host": args.host,
        "api_version": args.api_version,
        "period": args.period,
        "requested_metrics": metrics,
        "media_fields": DEFAULT_MEDIA_FIELDS.split(","),
        "note": "Metric availability varies by media type, API version, permissions, login flow, and account state. See insight_errors per post.",
    }
    json_path, csv_path = write_outputs(records, Path(args.output_dir), metadata=metadata)
    error_count = sum(len(record.insight_errors) for record in records)
    logging.info("Wrote %s and %s", json_path, csv_path)
    if error_count:
        logging.warning("Recorded %d metric-level errors or empty responses; see JSON output", error_count)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit("Interrupted")
