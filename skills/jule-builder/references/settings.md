# Jule Settings Guide

Behaviour settings live in `settings_config` (a `SettingsInfo`): when a popup shows (trigger,
targeting, schedule, frequency), how it is embedded (`sign_up_config`), what happens in Iterable
on submit, page logic, languages and the email deliverability check. Field names and types are in
the schema part `jule://docs/schema/settings_config` (or `whoami` with `doc: "document-schema"`,
`section: "settings_config"`); this guide explains the semantics the widget and Jule
actually apply. Display-related `sign_up_config` fields are in `jule://docs/project-style`.

Unknown keys in `settings_config` are dropped on save, and
`settings_config.iterable_integration.api_key` is always stripped (the workspace connection holds
the key). Saving merges `settings_config` key by key over the stored one (top-level keys you send
replace the stored value; keys you omit stay).

## Triggers: `trigger_id` versus `trigger_*` fields

A popup's trigger is a **workspace trigger** referenced by the top-level `trigger_id` (null for
none). The document's own `trigger_type`, `trigger_delay`, `trigger_scroll_depth`,
`trigger_desktop_enabled`, `trigger_mobile_enabled`, `trigger_manual_condition`,
`targeting_conditions`, `schedule_config` and `display_frequency` are what the widget reads —
but when `trigger_id` is set Jule **overwrites all of them** from the trigger every time
the widget payload is built. So: attach a trigger with `trigger_id` (tools: `list_triggers`,
`save_trigger`; the editor's Settings tab has the picker) and leave the `trigger_*` fields alone,
or leave `trigger_id` null and write the fields directly. `trigger_id` must belong to the
project's workspace.

Trigger types (`trigger_type`): `immediate` (the widget's default when nothing is set), `delay`
(after `trigger_delay` seconds), `scroll` (at `trigger_scroll_depth` percent), `exit_intent`
(mouse leaves the viewport; desktop only — the editor locks the device to desktop), `manual`
(opened by `Jule.show()` in the host page or when `trigger_manual_condition` — a CSS selector or
JS expression — is met; the editor excludes time-on-page and scroll-depth conditions for it),
`engagement` (editor label "Conditional Behavior": show when the targeting conditions pass,
including the behavioural ones). The workspace trigger form offers Conditional Behavior, Exit
Intent and Manual (JavaScript API); `delay` and `scroll` are stored variants of Conditional
Behavior. `trigger_desktop_enabled` / `trigger_mobile_enabled` (default true) gate by device.

Inline popups (`sign_up_config.display_mode: "inline"`) ignore delay/scroll/exit triggers and
evaluate only the static targeting conditions; in bubble/teaser mode without a `trigger_type`
the teaser click is the trigger.

## Targeting conditions (`targeting_conditions`)

```json
{
  "topLevelOperator": "AND",
  "rules": [
    {
      "operator": "AND",
      "conditions": [
        {
          "type": "device_type",
          "operator": "equals",
          "value": "desktop",
          "enabled": true
        },
        {
          "type": "country",
          "operator": "any_of",
          "value": ["US", "CA"],
          "enabled": true,
          "logicOperator": "and"
        }
      ]
    }
  ],
  "display_until": { "enabled": true, "events": ["form_submit"] }
}
```

- `rules[]` are groups; `topLevelOperator` (`AND` | `OR`) combines groups, `rules[].operator`
  combines the conditions of a group, and each condition after the first may carry
  `logicOperator` (`and` | `or`, plus `and_not` | `or_not` in the type) describing how it chains to
  the previous one in the editor's diagram. `arrows` (`[{ fromIndex, toIndex }]`, indexes into
  the group's `conditions`) are the editor's canvas connectors — layout only; omit them and the
  editor draws the chain from `logicOperator`. `enabled: false` switches a condition off without
  deleting it.
- Condition types, editor label, operators and value format:

| `type`                                | Editor label                      | Operators                                               | `value`                                               |
| ------------------------------------- | --------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `device_type`                         | Device Type                       | `equals`, `not_equals`, `any_of`                        | `phone` \| `tablet` \| `desktop` (array for `any_of`) |
| `country`                             | Country                           | `equals`, `not_equals`, `any_of`                        | ISO 3166-1 alpha-2 code(s) (`"US"`)                   |
| `time_on_page`                        | Total seconds on page             | `greater_than`, `less_than`                             | seconds                                               |
| `past_visits`                         | Past Visits                       | `greater_than`, `less_than`, `equals`                   | number of visits                                      |
| `referring_url`                       | Website URL                       | `equals`, `contains`, `not_contains`                    | string                                                |
| `first_time_visitor`                  | First Time Visitor                | `equals`                                                | `"true"` \| `"false"`                                 |
| `pages_visited`                       | (not in the editor list)          | —                                                       | number                                                |
| `cookie_value`, `local_storage_value` | Cookie Value, Local Storage Value | `equals`, `contains`                                    | `"name=value"` style string as the editor writes it   |
| `scroll_depth`                        | Scroll Depth                      | `greater_than`, `less_than`, `equals`                   | percent                                               |
| `exit_intent`                         | (behavioural)                     | —                                                       | —                                                     |
| `iterable_list_membership`            | Iterable List                     | `any_of` (show to members), `none_of` (exclude members) | Iterable list ids as numbers (`[123]`)                |
| `iterable_user_exists`                | Existing Iterable User            | `equals`                                                | `"true"` \| `"false"`                                 |

- `time_on_page`, `scroll_depth` and `exit_intent` are **behavioural**: evaluated while the page is
  used; inline popups disable them. The two `iterable_*` types are evaluated **server-side**
  (`POST /projects/:id/audience/evaluate`) with the workspace's Iterable key and need an active
  Iterable connection; the list ids must exist (`jule://workspaces/{id}/integrations` → `lists`).
- `display_until`: keep showing the widget until one of the named widget events (`form_submit`,
  `close`, …) has happened for the visitor.

## Schedule (`schedule_config`)

`enabled`, `start_date` / `end_date` (`YYYY-MM-DD`), `start_time` / `end_time` (`HH:mm`, apply on
the first/last day), `active_start_time` / `active_end_time` (daily window), `active_days`
(0 = Sunday … 6 = Saturday), `timezone` (IANA name; the editor lists
`Intl.supportedValuesOf('timeZone')`). Outside the schedule the popup does not show.

## Display frequency (`display_frequency`)

`type`: `until_completed` (default — show until the visitor submits), `once`, `always`, `multiple`
(up to `max_displays`), `once_per_session`, `cooldown` (again after `cooldown_days`). Editor labels:
Once, Always, Multiple times, Once per session, Once every N days. On a successful submit the
widget marks the popup completed for `until_completed` and `once`, and records a display for every
type. Preference centers ignore frequency.

## Sign-up config (`sign_up_config`) — behaviour half

`display_mode` and the teaser/bubble/banner looks are described in the project style guide. The
behaviour fields: `success_behavior` (`message` | `redirect` | `hide`; editor: Show Message,
Redirect, Hide Form) with `success_message` and `success_redirect_url` — these are the **legacy**
post-submit path, used only when the page has no `success_message` item; `i18n[locale]` overrides
`bubble_text` and `success_message`. Every popup created in the editor has a `sign_up_config`
(`{ "display_mode": "popup" }` at minimum); its presence is what makes the widget reveal
`success_message` items after submit, so always include it in a popup document.

## Page logic (`logic_rules`, `logic_fallback`, `logic_fallback_scores`, `logic_positions`)

Rules branch the visitor when they leave a page with a forward action. All maps are keyed by
**page id** (real UUIDs — placeholders are not remapped, so add logic in a second save).

```json
{
  "logic_rules": {
    "<page-id>": [
      {
        "id": "r1",
        "conditions": [
          { "field": "plan", "operator": "equals", "value": "pro" }
        ],
        "destination": { "type": "page", "pageId": "<pro-page-id>" },
        "score": 5
      }
    ]
  },
  "logic_fallback": { "<page-id>": { "type": "submit" } },
  "logic_fallback_scores": { "<page-id>": 0 }
}
```

- Evaluation order on Next: the **first rule whose conditions all hold** (AND) wins → else the
  page's `logic_fallback` → else the next page in order → else `submit`. A rule pointing at a
  deleted page falls through to `submit`. A matched rule overrides the clicked button's own
  destination; a button's terminal action (redirect, target page, close) overrides only the
  fallback. A Submit button routed by a rule to a terminal page or a URL still submits
  (`submit_and_page` / `submit_and_redirect`).
- `conditions[].field` is an input or rating `fieldName`, or `__score__` (running total of the
  `score` values of matched rules and taken fallbacks, one contribution per page; shown in text
  with `{% __score__ %}`). Only fields on
  the current or earlier pages can be used.
- `operator`: `equals`, `not_equals` (numeric when both sides parse as numbers, else string),
  `contains`, `not_contains` (substring, case-insensitive; array membership for multi-value
  answers), `greater_than`, `less_than`, `greater_or_equal`, `less_or_equal` (numeric only),
  `any_of`, `none_of` (`value` is an array), `is_empty`, `is_not_empty` (no `value`). The editor
  offers per field kind: text → equals/not_equals/contains/not_contains/is_empty/is_not_empty;
  number and rating → comparisons; choice (radio, dropdown, single-select) →
  equals/not_equals/is_empty/is_not_empty; checkbox → equals/not_equals against `"true"`; date and
  time → comparisons (lexical `YYYY-MM-DD` / `HH:mm`).
- `destination.type`: `page` (+ `pageId`), `submit`, `close`, `redirect` (+ `url`),
  `submit_and_page` (+ `pageId`), `submit_and_redirect` (+ `url`).
- `logic_positions` (`{ "<page-id>": { x, y } }`, px on the Logic canvas) are optional. The
  dashboard's Logic canvas lays every page and terminal out by itself (top to bottom, branches
  side by side: 280×120 page cards, 180×64 terminals, 100px between ranks, 80px between
  siblings) and only uses `logic_positions` for nodes the user dragged, so **omit the map**: a
  document without it opens as a clean diagram, and "Reset layout" in the dashboard clears it.
  Send positions only to pin a page where the user placed it.

### Designing logic: branching, quizzes, scores

- **Rule order matters.** Rules of a page are tried top to bottom and the first full match wins,
  so put the specific rule (`plan equals "enterprise"`) before the broad one (`plan is_not_empty`).
  Every rule of one page is keyed by that page's id; a rule can read any field answered on the
  current page or an earlier one — never a later one.
- **Branching.** One question page whose `single-select` / `radio` input has `submitOnSelect: true`
  (so the tap advances) or a `next` button, then one rule per option (`equals` the option `value`,
  not its label) with `destination.type: "page"`, and a `logic_fallback` for the options no rule
  names. Give branch pages their own `next` / `submit` buttons; a page reached by a rule is
  otherwise linear from there (the next page in order) unless it has rules of its own.
- **Quiz with a score.** Each answer page carries rules whose only job is `score`: one rule per
  correct or weighted answer (`conditions: [{ field: "q1", operator: "equals", value: "b" }]`,
  `score: 10`, `destination` = the next question page), plus `logic_fallback` to the same next
  page with `logic_fallback_scores[pageId]: 0` for a wrong answer. The result page(s) branch on
  `__score__`: on the **last question page** write rules ordered high to low (`__score__`
  `greater_or_equal` 20 → "Expert" page, `greater_or_equal` 10 → "Intermediate" page) and a
  `logic_fallback` to the "Beginner" page. Show the total in a `text` item with `{% __score__ %}`
  (`{{…}}` reads the Iterable profile, not the quiz). Result
  pages end with `close` or `redirect` (an exit, not a dead end) or a `submit` button when the
  answers should be recorded; with a submit earlier in the flow the result page just shows.
  Send the score to Iterable with `page_iterable_fields[resultPageId]` (`source: { type: "score" }`).
- **Fallbacks.** A page with rules always needs `logic_fallback` when some answer matches no rule;
  without it the widget goes to the next page in order, which is right for a linear quiz and
  wrong for a branch whose "other" path should submit or close. `validate_project_document` warns
  about pages with no way forward; it cannot know which branch you meant, so check every rule's
  `pageId` against the ids `get_project` returns (a rule to a missing page silently submits).
- **Two saves.** Placeholder page ids are not remapped inside `logic_rules`, `logic_fallback`,
  `logic_fallback_scores` or `page_iterable_*`: save the pages first, read the real ids, then save
  again with the logic.

## Languages (`localeConfig`)

The full guide — which fields of every item type are translated, how the visitor's language is
chosen, RTL, what happens when a translation is missing, and the completeness warnings — is
`jule://docs/languages`. In short:
`{ "defaultLocale": "en", "enabledLocales": ["en", "de", "ar"], "directions": { "ar": "rtl" } }`.
The base strings stay in the plain fields; translations go into the `i18n` maps of items
(`config.i18n[locale][field]`, `style_info.i18n[locale]`), `style_config.i18n[locale]` (header/footer
HTML, SEO strings, button labels) and `sign_up_config.i18n[locale]` (`bubble_text`,
`success_message`). The widget picks the visitor's locale from the enabled list and falls back to
the base string per field, so partial translations are safe. Coupon nested texts (screens, wheel
labels) are translated too. The editor's language list has 31 curated codes (`en`, `es`, `fr`, `de`,
`it`, `pt`, `pt-BR`, `nl`, `sv`, `no`, `da`, `fi`, `pl`, `cs`, `ro`, `el`, `tr`, `ru`, `uk`,
`ja`, `ko`, `zh`, `zh-TW`, `th`, `vi`, `id`, `hi`, `ar`, `he`, `fa`, `ur`); `ar`, `he`, `fa`,
`ur` are RTL.

## Iterable on submit (`iterable_integration`)

Per-project behaviour; the workspace holds the API key. `enabled` turns it on. `actions`
(`subscribe`, `track_event`, `update_profile`; `action` is the legacy single value):

- `subscribe`: `list_ids` (numbers; `list_id` is legacy), `unsubscribe_list_ids`,
  `subscribe_channel_ids`, `unsubscribed_channel_ids`, `subscribed_message_type_ids`,
  `unsubscribed_message_type_ids`. Checkbox inputs add their own `iterable*Ids` when checked.
- `track_event`: `event_name`, `track_event_mappings` (`{ survey_field: <fieldName or item id>,
iterable_field, survey_field_name, enabled, actions?, group? }`), `track_event_custom_fields`
  (`{ key, value }`, `{{fieldName}}` placeholders allowed), `track_event_groups` (editor labels).
- `update_profile`: `update_profile_mappings`, `update_profile_custom_fields`,
  `update_profile_groups`. `field_mappings` is the legacy list applied to every action.
- **Which Iterable field names exist.** `jule://workspaces/{id}/integrations` → `iterable.fields`
  lists the workspace's user-profile fields with their Iterable types (`string`, `long`, `date`,
  `boolean`, …) — the same list the dashboard's mapping dropdown shows. Write `iterable_field`
  from that list: `email` and `phoneNumber` are Iterable's reserved profile fields (a phone input
  must map to `phoneNumber` or SMS can never reach the visitor), `userId` identifies by id; any
  other name creates a custom field on first write. A `date` field wants a date-time input with
  `timeValueFormat: "offset"` or `"utc"`. Put related fields in a `group` (`group: "address"`)
  to nest them (`address.city`).
- **Which event names exist.** `event_name` (and `page_iterable_actions[pageId].eventName`) should
  be a custom event of the workspace: `jule://workspaces/{id}/events` lists them with their
  descriptions. A name that is not listed is created for you on save when you hold the
  permission the dashboard's Events page needs (the save result names what it created); without
  it the save keeps the name and warns, and the dashboard's Events page shows the gap.
- **Hosted unsubscribe.** The workspace-level one-click-unsubscribe setting (what the "unsubscribe"
  link in an Iterable email does: `campaign_channel`, `global_email` or `specific_channels` with
  channel ids) is read-only in `jule://workspaces/{id}/integrations` → `iterable.settings`; it is
  changed in the dashboard (Settings → Integrations → Iterable). The per-project
  `one_click_unsubscribe_behavior` below overrides it for that preference center.
- Timing: `send_on_complete` (default true) or after the page named in `send_on_question`.
- Preference center: `preference_center_enabled` loads the visitor's subscriptions and writes them
  back; `channels` (`{ id, name, channelType? }`) and `message_types`
  (`{ id, name, subscriptionPolicy? }`) mirror the live Iterable data for rendering. **What a
  toggle shows on arrival** follows the message type's `subscriptionPolicy`: `OptIn` and
  `DoubleOptIn` types start unchecked unless the visitor is explicitly subscribed; every other
  policy (`OptOut`, or none) starts checked unless the visitor is explicitly unsubscribed, which is
  Iterable's own default. Copy `subscriptionPolicy` from the integrations resource so the page
  shows the real state, and never set `defaultValue` on a channel toggle.
- Visitor identity on a hosted page: `?email=` or `?userId=` in the URL, or `window.JULE_USER_DATA`
  on the host page. With `use_token_validation` the URL must also carry `?hash=`, an HMAC of that
  email or userId signed with the workspace's Iterable HMAC signing secret (Settings → Integrations
  → Iterable; an Iterable template can compute it), or the page refuses to load or save the
  preferences. That secret is what the "HMAC signing secret is missing" warning is about;
  `token_secret` is write-only and configured in the dashboard.
  `one_click_unsubscribe_behavior` (`campaign_channel` | `global_email` | `specific_channels` +
  `channel_ids`) overrides the workspace one-click setting for this page only.
- SMS double opt-in: `sms_double_opt_in_message_type_ids` names the SMS message types that need the
  visitor's own confirmation. When a submission carries a phone number and an email or userId,
  Jule asks Iterable to start its SMS double opt-in for those types instead of subscribing them
  outright (once per phone number per project per day); `sms_double_opt_in_brand_name` is the
  brand named in the confirmation text. With only double-opt-in types configured, the ordinary
  subscribe step is skipped.

Per-page Iterable writes: `page_iterable_actions[pageId]` (`enabled`, `actions` of
`update_profile` / `track_event`, `eventName`) and `page_iterable_fields[pageId]`
(`{ id, fieldKey, source: { type: "static", value } | { type: "score" } }`) fire when the
visitor reaches that page. Keys are page ids.

## Email deliverability check (`email_deliverability_check`)

Default **on** (the served payload sets it to `true` unless the document says `false`; the editor's
Settings tab toggle "email deliverability" exists for popups). Before advancing from a page with an
`email` input, and again before submit across all pages, the widget asks the server whether the
domain can receive mail (DNS MX lookup). It is fail-open: timeouts, network errors and server
errors let the visitor through; only an explicit "no mail server" answer blocks, with the message
"This email domain can't receive mail. Please check for a typo." (localized for es/fr/de). Set it
to `false` only when the audience uses internal domains without public MX records.
