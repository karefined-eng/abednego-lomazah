# Instagram Graph API Insights Extractor

This script fetches media owned by an Instagram professional account, follows pagination, requests per-media insights, and writes normalized JSON and CSV outputs. It requests each metric separately so that an unsupported metric for one post or media type is recorded as an error instead of stopping the full extraction.

## Requirements

Use a supported Instagram professional account and an access token with the permissions required by the selected Meta login flow. Meta’s documentation identifies `instagram_basic` and `instagram_manage_insights` as core permissions for Insights; Page/Business Manager workflows may require additional permissions. See the official documentation in the references below.

The script targets the current documented version `v26.0` by default and uses `https://graph.instagram.com` as the default host. Override both with environment variables or command-line flags if your approved login flow uses a different host or version.

## Secure configuration

Do not place a real token in source control or in a shell-history-visible command. Set environment variables in your local shell or use a secret manager:

```bash
export IG_USER_ID="YOUR_INSTAGRAM_PROFESSIONAL_ACCOUNT_ID"
export IG_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
export IG_API_VERSION="v26.0"
export IG_GRAPH_HOST="https://graph.instagram.com"
```

For the account ID, use the Instagram professional-account ID required by your selected Meta login flow. Do not substitute a username unless your approved API flow explicitly resolves it.

## Basic run

```bash
python3 instagram_graph_insights.py \
  --output-dir instagram_insights_output
```

The command follows the `/USER_ID/media` cursor until pagination is exhausted, then requests the configured insight metrics for each media object. It writes:

```text
instagram_insights_output/instagram_post_insights.json
instagram_insights_output/instagram_post_insights.csv
```

To test with only the first five posts:

```bash
python3 instagram_graph_insights.py \
  --max-posts 5 \
  --output-dir sample_output
```

To request a narrower metric set, which can reduce API calls and unsupported-metric noise:

```bash
python3 instagram_graph_insights.py \
  --metrics "comments,likes,saved,shares,total_interactions,reach,views,follows,profile_activity,profile_visits,link_clicks,navigation,reels_skip_rate" \
  --output-dir instagram_insights_output
```

## Output structure

The JSON file contains extraction metadata, one record per media object, an `insights` object keyed by metric name, and an `insight_errors` array. The CSV flattens successful metric values into columns and includes an `insight_error_count` column.

A metric error is not automatically a script failure. Meta documents that metric availability varies by media type, version, permissions, login flow, and account state. The script therefore preserves the API’s error message or empty-data condition for diagnosis.

## Important API caveats

Meta documents that insight data may be delayed by up to 48 hours. Story metrics have a much shorter availability window, so Story data should be collected promptly and may require webhook-based handling. Some account-level follower metrics are unavailable for professional accounts with fewer than 100 followers. The script is focused on media-level insights and does not claim that every metric is valid for every post.

The documented media metric catalog includes metrics such as `comments`, `likes`, `saved`, `shares`, `total_interactions`, `reach`, `views`, `follows`, `profile_activity`, `profile_visits`, `link_clicks`, `navigation`, `replies`, `reposts`, `crossposted_views`, `facebook_views`, `ig_reels_avg_watch_time`, `ig_reels_video_view_total_time`, and `reels_skip_rate`. `impressions` is deprecated for media created after July 2, 2024 according to the current Media Insights reference. The default list is intentionally broad; use `--metrics` to tailor it to your media mix and permissions.

The script does not expose or log access tokens. However, protect the output files because media URLs and captions may be sensitive and signed media URLs can expire.

## Recommended operational pattern

Run the extractor after the 48-hour data-delay period for stable post-level comparisons, and run a separate frequent collector for Stories if Story analytics are important. Store each run with its extraction timestamp rather than overwriting historical snapshots. Join the output to a content registry containing hook, audio, caption, campaign, and UTM identifiers so that API metrics can be analyzed alongside off-platform attribution.

## Official references

- [Meta — Instagram Insights](https://developers.facebook.com/documentation/instagram-platform/insights)
- [Meta — Instagram Media Insights](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media/insights)
- [Meta — Instagram Account Insights](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-user/insights)
