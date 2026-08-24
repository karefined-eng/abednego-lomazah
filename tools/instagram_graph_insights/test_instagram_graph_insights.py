import csv
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock

import instagram_graph_insights as ig


class FakeResponse:
    def __init__(self, payload, status_code=200, headers=None):
        self._payload = payload
        self.status_code = status_code
        self.headers = headers or {}
        self.text = json.dumps(payload)

    def json(self):
        return self._payload


class FakeSession:
    def __init__(self, responses):
        self.responses = responses
        self.calls = []

    def get(self, url, params=None, timeout=None):
        self.calls.append((url, params, timeout))
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


class ExtractorTests(unittest.TestCase):
    def test_media_pagination(self):
        session = FakeSession([
            FakeResponse({
                "data": [{"id": "1"}, {"id": "2"}],
                "paging": {"next": "https://graph.instagram.com/v26.0/user/media?after=abc"},
            }),
            FakeResponse({"data": [{"id": "3"}]}),
        ])
        media = ig.fetch_media(
            session,
            user_id="user",
            host="https://graph.instagram.com",
            api_version="v26.0",
            token="secret",
            fields="id",
            page_size=100,
            max_posts=0,
            timeout=5,
            retries=0,
        )
        self.assertEqual([item["id"] for item in media], ["1", "2", "3"])
        self.assertEqual(len(session.calls), 2)
        self.assertEqual(session.calls[0][1]["access_token"], "secret")
        self.assertEqual(session.calls[1][1]["access_token"], "secret")
        self.assertNotIn("fields", session.calls[1][1])

    def test_metric_parsing(self):
        value, period = ig.extract_metric_value({
            "name": "views",
            "period": "lifetime",
            "values": [{"value": 123}],
        })
        self.assertEqual(value, 123)
        self.assertEqual(period, "lifetime")

    def test_metric_error_is_recorded(self):
        session = FakeSession([
            FakeResponse({
                "error": {"message": "Metric unsupported", "code": 100, "type": "OAuthException"}
            }, status_code=400)
        ])
        result = ig.fetch_one_metric(
            session,
            media_id="media",
            metric="reels_skip_rate",
            period="lifetime",
            host="https://graph.instagram.com",
            api_version="v26.0",
            token="secret",
            timeout=5,
            retries=0,
        )
        self.assertEqual(result.metric, "reels_skip_rate")
        self.assertIsNotNone(result.error)
        self.assertEqual(result.status_code, 400)
        self.assertNotIn("secret", result.error)

    def test_outputs(self):
        record = ig.PostRecord(
            id="1",
            timestamp="2026-08-24T00:00:00+0000",
            media_type="VIDEO",
            media_product_type="REELS",
            permalink="https://instagram.com/reel/abc",
            caption="test",
            insights={"views": {"value": 10, "period": "lifetime"}},
        )
        with tempfile.TemporaryDirectory() as temp:
            json_path, csv_path = ig.write_outputs([record], Path(temp), metadata={"api_version": "v26.0"})
            payload = json.loads(json_path.read_text())
            self.assertEqual(payload["posts"][0]["insights"]["views"]["value"], 10)
            with csv_path.open(newline="") as handle:
                rows = list(csv.DictReader(handle))
            self.assertEqual(rows[0]["views"], "10")


if __name__ == "__main__":
    unittest.main()
