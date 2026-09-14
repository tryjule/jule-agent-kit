# Metric definitions

What every field of `analytics_overview` means — the same text the tool returns under `definitions`.

| Field | Meaning (the dashboard's words) |
|---|---|
| `total_impressions` | Views: times the widget was displayed (one per page load; a re-shown popup counts again). |
| `unique_impressions` | Sessions (visitors) that saw the widget at least once. |
| `total_opens` | Opens: sessions that opened the widget. |
| `total_starts` | Starts: sessions with a first interaction (typed, selected or clicked). Tracked since May 2026. |
| `total_submissions` | Submissions, also called leads or responses: sessions that submitted a form. |
| `total_completions` | Completions: sessions that reached the last page. |
| `total_closes` | Close clicks. |
| `unique_sessions` | Distinct sessions with any event in the range. |
| `active_projects` | Projects with at least one event in the range. |
| `open_rate` | Open rate, %: opens / sessions that saw the widget. |
| `conversion_rate` | Conversion rate, %: submissions / sessions that saw the widget (views to leads). |
| `completion_rate` | Completion rate, %: completions / starts. 0 with zero starts (the dashboard shows a dash). |
| `submission_rate` | Deprecated "Response rate", %: submissions / opens. Prefer conversion_rate. |
| `avg_duration_seconds` | Mean session length in seconds. |
| `avg_completion_seconds` | Avg. completion time: mean length of the sessions that completed. |
| `avg_pages_viewed` | Mean pages viewed per session. |
| `trends` | Percent change against the previous period of the same length (range.previous_*); null means the previous period was 0, the dashboard shows "New". |
