# Jule Best Practices

Guidance for building pop-ups, preference centers and landing pages that work in Jule's widget.
Where a line describes how the widget behaves it comes from the runtime; where it is a
recommendation (copy length, number of fields) it is marked as such. Read
`jule://docs/item-catalog`, `jule://docs/project-style` and `jule://docs/settings` for the fields.

## Before you draft

1. Read `jule://workspaces/{id}/branding`: use `brand:<name>` colors, the workspace font
   (`fontFamily` + `fontUrl`), a branding logo and the legal texts (privacy URL, SMS disclaimer).
2. Read `jule://workspaces/{id}/integrations`: Iterable connected and active? Which lists,
   channels and message types exist? Are coupons enabled, is a provider connected? Never add a
   channels group, Iterable list ids or a coupon item the workspace cannot honour.
3. Decide the type: `popup` (embedded on the customer's site), `preference_center` (hosted, with a
   channels group), landing page (hosted `preference_center` without a channels group).
4. Start from a template when one fits (`list_templates`); it carries a working structure and
   the project's frozen style defaults.
5. Build from Jule items, not raw HTML. Headings and copy are `text`, pictures `logo`, calls to
   action `button`, fields `input`, layout `flex` Boxes; that is what the customer can edit,
   translate, brand, adapt and measure in the dashboard. An `html-block` is only for what the
   items cannot show (embedded video, third-party widgets, tables, custom vector art) — never a
   heading, paragraph, image, field, button, section or page. Validation warns when a block holds
   page content or form controls; say which parts fell back to it and why.

## Pop-ups

Structure that the widget rewards:

- **One goal per pop-up, one primary action per page.** Page 1 collects (heading, one supporting
  sentence, the fields, the button). Page 2 thanks or rewards (a `success_message` or a `coupon`
  item plus a `close` button). Two pages is the common shape; three or more only for quizzes with
  logic rules.
- **A way forward on every page.** Each page except the last ends with exactly one forward
  button: `next` while the form continues, `submit` on the page where it ends. Submit once per
  visit — a `submit_and_next` followed by more questions loses their answers. The thank-you page
  holds text (or a `success_message` / `coupon` item) and a `close` or `redirect` button, no forward
  action. Never set `style_config.hide_next`: it hides your own Next buttons.
- **Ask for the minimum.** Email alone converts best; add `tel` only when SMS is the channel (it
  requires a linked SMS disclaimer text and a valid E.164 number to proceed). Mark fields
  `required` deliberately: a required field blocks Next/Submit until valid.
- **Always give a way out.** Popup and bubble modes render the close button; keep
  `banner_show_close_button` on for banners. `close` and `redirect` buttons skip validation so a
  visitor can leave with an unfinished form.
- **Terminal page.** The last page should hold no forward action (`next`, `skip`, `submit*`, or a
  `submitOnSelect` input) so the widget knows the flow is complete; a `close` button or a
  `redirect` button is fine.
- **Keep `sign_up_config` present** (`{ "display_mode": "popup" }` minimum) — it is what turns on the
  `success_message` reveal.
- **Frequency and trigger.** Default frequency `until_completed` is right for lead capture; use
  `cooldown` for recurring promotions. Attach a workspace trigger via `trigger_id` rather than
  writing `trigger_*` fields (they are overwritten when a trigger is linked). Exit-intent is
  desktop only.
- **Consent.** A checkbox input with the consent sentence as `placeholder`, `required: true` when
  the law demands opt-in; link the privacy policy from branding `legal.privacy_policy_url` in a
  `text` item with `tag: "a"`.
- **Coupons.** Coupon on page 2, `coupon_id` set, an `email` (or `tel` for phone coupons) input on
  page 1 ending in a `submit` button (the answers are recorded, then the coupon page reveals),
  `success_text` and `shop_now_url` filled; `show_expiry` only when the coupon has an expiry.

## Preference centers

- **Channels group from live data.** Build the `iterableChannelsGroup` structure with the exact
  channel and message-type ids from the integrations resource; mirror them in
  `settings_config.iterable_integration.channels` / `message_types`, set
  `preference_center_enabled: true` and `actions: ["update_profile"]`. Without an active Iterable
  connection a preference center cannot load or save subscriptions.
- **Explain, then toggle.** A heading and one paragraph above the group, plain-language checkbox
  labels (`placeholder` is the label), message types indented under their channel (the editor's
  defaults do this), helper checkboxes (`helperCheckbox: "both"`) for long lists.
- **Submit and feedback.** One `button` with `action: "submit"`; enable the notification toast
  (`notification_enabled`, success and error texts) — preference centers show it after submit.
- **Identity.** Decide how visitors arrive: from Iterable emails with `?email=` / `?hash=` (turn on
  `use_token_validation` for signed links; the secret is set in the dashboard), or logged in via
  `window.JULE_USER_DATA`.
- **Chrome.** `card_width: "100%"`, `card_padding: "0px"`, `display_mode: "whole_page"`, header
  and footer linked to branding (`preference_center_header_linked` / `_footer_linked`), SEO title
  and description filled. One-click unsubscribe behaviour set explicitly.
- **Unsubscribe path.** Offer "unsubscribe from all" (helper checkbox `unsubscribe_all` or `both`)
  so the page satisfies the mail regulations the customer is subject to.

## Landing pages

- **Sections as Boxes.** One `flex` item per section with `config.htmlId` (`hero`, `features`,
  `pricing`) so header links scroll; `display: "grid"` for columns with
  `responsive.mobile.gridTemplateColumns: "1fr"`; `display: "stack"` only for overlaps (badges,
  captions over images).
- **Hosted chrome.** `display_mode: "whole_page"`, header/footer linked to branding or written in
  the `preference_center_header_*` fields, SEO fields (`seo_page_title`, `seo_meta_description`,
  `seo_og_image_url`, `seo_favicon_url`). The custom domain is configured in the dashboard.
- **Images.** `logo` items take hosted URLs: a branding logo, an entry from `list_assets` (`url`
  key or `public_url`), or a file you upload with `upload_branding_asset` (`source.url` for a public URL, `source.base64` for a
  small file, `source.upload_link: true` for a file on the user's machine). Upload the user's real pictures and logo rather than drawing a
  substitute. Use `objectFit` and `width` to size them.
- **Forms on the page.** Inputs + a `submit` button + a `success_message` item in the same section.
- **Items, not HTML sections.** Every hero, feature grid, pricing row and footer is a `flex` Box
  holding `text`, `logo`, `icon` and `button` items — the editor-built marketing pages in Jule use
  no `html-block` at all. An `html-block` is the escape hatch for one thing the items cannot show
  (an embedded video, a third-party widget, a table, custom vector art), never a section or the
  page; inside it nothing is editable per element, translated per field, branded, responsive or
  measured, and a form inside it is never submitted. Say which parts fell back to it and why.

## Mobile

- The widget's breakpoints are ≤768px (mobile) and ≤1024px (tablet). Use `visibility` to hide
  decorative items on mobile and `style_info.responsive.mobile` / `style_config.responsive.mobile`
  for size changes (font sizes, paddings, `card_width`, `gridTemplateColumns`).
- Popup card: `card_width` up to `400px` fits phones; wider cards need a `responsive.mobile`
  `card_width` of `90%` or so. Two-column popups stack on mobile by default
  (`mobile_column_layout: "stacked"`); consider `mobile_hide_left_column` for image columns.
- Keep option cards (`radio`, `single-select`) to ≤6 options on a page; long lists belong in
  `dropdown`.
- `date` / `time` inputs render native pickers; do not replace them with text inputs.

## Accessibility

- Every `logo` gets `altText`; decorative `icon` items keep `altText` empty (they are
  `aria-hidden`).
- Heading order: one `h1` per page, `h2`/`h3` beneath it; do not pick tags for size — use
  `fontSize`.
- Checkbox labels come from `placeholder`; write full sentences ("I agree to receive marketing
  emails"). Selection inputs need distinct `label`s per option.
- Contrast: check brand colors used for text on the card background; the editor shows a contrast
  status for the current selection. Default text `#111827` on `#ffffff` passes.
- Buttons need verbs ("Get my code", "Save preferences"), not "Submit".
- `tag: "a"` links to external sites should open in `_blank` (the widget adds
  `rel="noopener noreferrer"`).

## Copy length (recommendations)

- Headline (`h1`): 3–8 words. Supporting paragraph: one sentence, ≤ 20 words. Button: 1–4 words.
- Consent sentence: one line, name the sender and the channel.
- Success message: one sentence plus what happens next ("Check your inbox for the code.").
- Teaser (`bubble_text`): ≤ 4 words; rectangles at `center-left`/`center-right` are rotated, so
  keep them very short.
- Preference-center intro: two sentences at most; channel labels ≤ 3 words, message types ≤ 5.

## Before you save

- Validate with `validate_project_document` and fix every error; then save with the version you
  read. Reread with `get_project` to learn the real ids before adding logic rules keyed by page.
- Preview (`preview_project`) and describe what the user will see; publish only when the user asks
  after the preview, through the confirmation step.
