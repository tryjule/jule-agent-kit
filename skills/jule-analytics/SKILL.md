---
name: jule-analytics
description: >
  Read and explain how a pop-up, sign-up form, quiz, preference center or landing page is
  performing — views, opens, submissions (leads), conversion and completion rates, drop-off per
  page, funnel, engagement, countries, individual sessions, status history and A/B test results —
  and turn the numbers into one grounded recommendation. Use for "how is my pop-up doing", "why
  did sign-ups drop last week", "where do visitors leave the quiz", "report on <project>",
  "compare this month with last", "which variant is winning". Read-only: it never changes or
  publishes a project.
license: MIT
---

# Reading Jule analytics

Every number comes from the `jule` MCP server's two analytics tools, which return exactly what the
Jule dashboard's Analytics pages show for the same period. Quote only numbers you fetched, name
the period, and use the dashboard's words (views, opens, submissions, conversion rate). Never
invent, round up or extrapolate.

## Tools

| Tool | What it returns |
|---|---|
| `analytics_overview(workspace_id \| project_id, range?, start_date?, end_date?, project_type?, limit?)` | The dashboard cards for a workspace or one project: `metrics` (+ `trends` vs the previous period), `daily` series, `growth`, `top_projects` (workspace only), `definitions`, `notes`. `range`: `7days` (default), `30days`, `3months`, `6months`, `1year`, or `start_date` + `end_date` (YYYY-MM-DD, at most one year). |
| `analytics_report(report, workspace_id \| project_id, range…, limit?, offset?)` | One table: `funnel` (daily views → submissions → completions), `page_dropoff` (sessions reaching each page), `engagement` (daily rates), `countries`, `submissions_by_popup`, `preference_fields`, `sessions` (individual visits), `activity_log` (when the project was published, activated, deactivated — explains drops and spikes; needs `project_id`). |

A/B tests: `list_experiments`, `get_experiment` (per-variant numbers). `metrics: null` or a note
saying the data is unavailable means exactly that — say so in one sentence without guessing why,
and continue with what you have.

Metric meanings are in `references/metrics.md` (the tool's `definitions`, kept identical by
`scripts/sync-references.mjs`). Structural and copy checks come from
`references/best-practices.md`.

## The analysis

The steps below are the server's own `analyze-project` prompt, kept identical by the sync script.
Read `jule://docs/item-catalog`, `jule://docs/project-style`, `jule://docs/settings` and
`jule://docs/best-practices` through the server (the builder skill carries the file copies), then:

<!-- sync:ANALYZE_STEPS -->
Steps:
1. Read jule://docs/item-catalog, jule://docs/project-style, jule://docs/settings and jule://docs/best-practices (or whoami with doc set to each name when your client cannot read resources); read jule://workspaces/<workspace_id>/branding and jule://workspaces/<workspace_id>/integrations for the resolved workspace.
2. Call get_project for the project (document, style_config, settings_config, status, version).
3. Get the numbers. Call analytics_overview with project_id (range 30days unless the user named a period; this is the dashboard's project analytics page). Then analytics_report for the detail the question needs: page_dropoff for where visitors leave, funnel for the daily views → submissions → completions path, engagement for daily rates, countries, sessions for individual visits, activity_log to see when the project was published, activated or deactivated (it explains drops and spikes). Call analytics_overview once more for the whole workspace to compare the project with its top_projects. If analytics is unavailable (insufficient_scope, or a note saying the data is unavailable) say so in one sentence — without guessing why — and analyze the document alone.
4. Check the document: structure (pages, a terminal page, a submit path), required fields and unique fieldNames, mobile (visibility, responsive overrides, card width), accessibility (altText on images, heading order, checkbox labels, contrast of the brand colors used), copy length, settings (trigger, display_frequency, targeting, schedule), Iterable mapping completeness and consistency with the connected lists and channels, coupon prerequisites, locales enabled but not translated.
5. Report a prioritized list: what is wrong or weak, why it matters, and the exact field(s) to change with the value you recommend. Quote numbers only from analytics you fetched, with the period, using the dashboard's words (views, opens, submissions, conversion rate).
6. End with one recommendation: the single change most likely to improve the metric the user asked about (conversion rate when they named none), tied to a number you fetched (for example "64% of sessions leave on page 2, so merge pages 2 and 3"), the exact field(s) to change, and how to verify it (which analytics_report to re-run after a week, or an A/B test with create_experiment). With fewer than 100 sessions in the period say the data is too thin for a performance call and recommend the strongest document-level fix instead. Never invent, round up or extrapolate numbers.
7. This prompt is read-only: do not call save_project_document, patch_project or set_project_status. Offer to apply the changes as a separate step and wait for the user.
<!-- /sync:ANALYZE_STEPS -->

## Reporting

- Lead with the answer to the question asked, then the evidence: period, the two or three numbers
  that matter, what changed against the previous period.
- One recommendation, tied to a number, with the exact field(s) to change and how to verify it.
  Fewer than 100 sessions in the period: say the data is too thin for a performance call and give
  the strongest document-level fix instead.
- This skill is read-only. Offer to apply the change as a separate step and wait for the user;
  applying it is the `jule-builder` skill's job.
