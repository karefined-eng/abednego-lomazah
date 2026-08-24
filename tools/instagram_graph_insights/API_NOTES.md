# Instagram Graph API implementation notes

Official sources reviewed:

- Meta Instagram Insights: https://developers.facebook.com/documentation/instagram-platform/insights
- Meta Instagram Media Insights: https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media/insights
- Meta Instagram Account Insights: https://developers.facebook.com/documentation/instagram-platform/reference/instagram-user/insights

Current documentation facts to implement:

- Current latest API version shown on the Media Insights reference is v26.0.
- Media insights endpoint: GET https://graph.instagram.com/{API_VERSION}/{IG_MEDIA_ID}/insights for Instagram Login host, or the host configured for the selected login flow.
- Required query parameters include metric, period, and access_token. Period values include day, week, month, lifetime, and total_over_range.
- Current media metric list includes comments, crossposted_views, facebook_views, follows, ig_reels_avg_watch_time, ig_reels_video_view_total_time, likes, link_clicks, navigation, profile_activity, profile_visits, reach, reels_skip_rate, replies, reposts, saved, shares, total_interactions, views, total_comments, total_likes, and total_views. `impressions` is deprecated for media created after July 2, 2024.
- Metric availability varies by media type and login route; the API may return an empty data set or an error for unsupported metrics. The script should request metrics individually or in a resilient batch and retain per-metric errors.
- Metrics may be delayed up to 48 hours and are stored for up to 2 years. Story metrics are only available for 24 hours; Story workflows need timely collection and possibly webhooks.
- Meta’s broader Insights documentation requires permissions such as instagram_basic and instagram_manage_insights; additional permissions can apply to Page/Business Manager flows.
- Account-level `follower_count` and `online_followers` are unavailable for professional accounts with fewer than 100 followers; online-followers history is limited to 30 days.
- Use media fields such as id, caption, media_type, media_product_type, timestamp, permalink, like_count, comments_count, media_url, and thumbnail_url, with paging cursors.
- Do not assume every account or media type supports every metric. Implement graceful handling and output a support/error field.
