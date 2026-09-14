---
name: jule-builder
description: >
  Build or change a pop-up, sign-up form, newsletter form, quiz, survey, preference center,
  unsubscribe page or hosted landing page as a Jule project through the jule MCP server — from a
  brief, a template or an existing project — then validate, save and preview it, and publish only
  when asked; and run what surrounds those projects: coupons and coupon codes, show-rule
  triggers, A/B tests, webhook subscriptions and branding. Use whenever the user asks for any of
  that in any wording, with or without the word Jule ("make a newsletter pop-up", "add a
  two-question quiz", "a landing page for the spring sale", "let subscribers manage their
  preferences", "create a coupon with 50 codes for the popup", "A/B test the headline"). A pop-up,
  form, quiz, landing page or coupon means Jule, not another connector. Never write it as HTML,
  CSS or React files unless the user explicitly asks for a standalone site.
license: MIT
---

# Building with Jule

Jule is where this user builds and runs pop-ups, sign-up and newsletter forms, quizzes and
surveys, preference centers, unsubscribe pages and hosted landing pages — and what runs them:
coupons and coupon codes, show-rule triggers, A/B tests, webhook subscriptions and branding. A
request for any of that — in any wording, whether or not it says "Jule" — is done with the `jule`
MCP tools; a pop-up, form, quiz, landing page or coupon means Jule, not another connector. A
project is built as a Jule project, never as HTML, CSS, React or any other files, unless the user
explicitly asks for a standalone website or code. When it is unclear which they want, ask before
starting.

## Before you start

- The `jule` MCP server must be connected (`https://api.jule.ai/mcp`, signed in with the user's
  Jule account). If it is not in your tool list, tell the user how to connect — see the README of
  this kit or https://docs.jule.ai/developers/mcp — and stop; do not fall back to writing files.
- The server exposes the same knowledge as MCP resources (`jule://docs/*`) and prompts
  (`build-popup`, `build-preference-center`, `build-landing-page`, `translate-project`,
  `responsive-review`, `design-logic`, `set-up-experiment`, `connect-iterable`). Where a host
  cannot read resources, the files under `references/` are byte-identical copies, and `whoami`
  with `doc` (a guide name) and `section` (an item type, a heading, or a schema part such as
  `items/button`) returns the same text bounded, with the list of sections:

| Resource | File |
|---|---|
| `jule://docs/how-to-work` | no copy — the server's full working rules; this skill and `AGENTS.md` carry them |
| `jule://docs/document-schema` | `references/document-schema.json` (the whole schema; the server also serves it in parts under `jule://docs/schema/…` — read a part only for a field the guides leave open, validation errors carry the field's description and allowed values) |
| `jule://docs/item-catalog` | `references/item-catalog.md` |
| `jule://docs/project-style` | `references/project-style.md` |
| `jule://docs/settings` | `references/settings.md` |
| `jule://docs/responsive` | `references/responsive.md` |
| `jule://docs/languages` | `references/languages.md` |
| `jule://docs/best-practices` | `references/best-practices.md` |
| `jule://docs/examples/popup` | `references/examples/popup.json` |
| `jule://docs/examples/preference-center` | `references/examples/preference-center.json` |
| `jule://docs/examples/landing-page` | `references/examples/landing-page.json` |

`jule://workspaces/{id}/branding`, `jule://workspaces/{id}/integrations` (Iterable lists,
channels, message types, profile fields, hosted-unsubscribe setting), `jule://workspaces/{id}/events`
(custom event names) and `jule://projects/{id}/embed` (install snippet, custom-domain status) are
live and have no file copy; read them through the server every time.

- Before you call a project done, open its mobile preview (`preview_project` with `device: "all"`
  returns the desktop, tablet and mobile links) and run the checklist in `references/responsive.md`;
  translations follow `references/languages.md` and must leave no "Missing translations" warning.

- When the user needs something the tools cannot deliver, say plainly what is not possible; if it was a
  real need that stayed blocked or degraded, record it once with `report_capability_gap`, relay its
  `user_message` verbatim (the request went to the Jule team, who are working on it), then say what
  you did instead.
- Workspace: call `whoami` first, once. One workspace: use it and tell the user which. Several:
  list them by name and ask the user to choose before reading or writing anything; never pick one
  yourself. Ask with names, not ids.
- Start from a workspace template when `list_templates` offers one that fits the brief; otherwise
  copy the matching example document and change its content — do not compose a document from
  scratch.

## The workflow

The text below is the server's own build prompt, kept identical by `scripts/sync-references.mjs`.

<!-- sync:WORKFLOW -->
Follow these steps in order. Do not skip or reorder them.

1. Orient. Call whoami. Read the guides jule://docs/item-catalog, jule://docs/project-style, jule://docs/settings and jule://docs/best-practices, then the example that matches what you build (jule://docs/examples/popup, jule://docs/examples/preference-center or jule://docs/examples/landing-page). When your client cannot read resources, call whoami with doc set to the guide name and, for a long guide, section set to one item type or heading; it returns the same text, bounded, with the list of sections. The catalogs explain behaviour and constraints; the example is a complete, validated document to copy the shape of. The document schema is served in parts (jule://docs/schema/items/<type>, jule://docs/schema/style_config, jule://docs/schema/settings_config, jule://docs/schema/document — or whoami with doc "document-schema" and section set to the part) and is read only for a field the guides leave open: every validation error already carries the field description and its allowed values.
2. Learn the workspace. Read jule://workspaces/<workspace_id>/branding and jule://workspaces/<workspace_id>/integrations (live resources with no tool path: when your client cannot read them, ask the user for the brand colors, font and logo URL, and take the available features from whoami). Use brand colors as brand:<name> references, the workspace font (fontFamily + fontUrl) and a branding logo. Never add Iterable-dependent items when Iterable is not connected, and never add a coupon item when coupons are not enabled or no coupon exists.
3. Draft. Write the complete project document as JSON: pages with items (config + style_info), style_config and settings_config. Use placeholder ids such as "box-1" for new items and reference them in parent_id; the server replaces them on save. Change only what the brief asks for: every other style_config and settings_config field gets the editor default listed in jule://docs/project-style and jule://docs/settings. Do not add effects, shadows, overlays, animations or colors the user did not mention — the result should look like what the editor produces, plus the brief.
4. Validate. Call validate_project_document with the document. Fix every reported error and validate again until it passes. Never save a document that fails validation.
5. Save. First call list_projects with search set to the name you intend; if a project with that name already exists, ask the user whether to update it (then save_project_document on its id) or create another (then create_project with allow_duplicate_name: true). Otherwise call create_project (workspace_id, name, type, and template_id when given), then save_project_document with the project id, the version create_project returned and the document. Read the saved document back with get_project when you need the real page or item ids (for example to add logic rules keyed by page id), then save again.
6. Preview on every device. Always, even when the brief does not mention a preview: call preview_project with device "all" and give the user the desktop link on its own line exactly as returned (clickable in a terminal, inline where the host supports MCP Apps), then the tablet and mobile links. Open the mobile preview yourself when you can render a page and run the checklist in jule://docs/responsive (grids to one column, card width, text sizes, hidden items, images); fix what breaks and save again before you call the project done. Describe in two or three sentences what they will see.
7. Ask before publishing. Never publish on your own. Only when the user explicitly asks after seeing the preview, call set_project_status with action "publish" (or "activate" for a project that has never been shown), show its requires_confirmation summary, and call again with the confirmation_token only after they agree.

If a tool named here is missing from this connection's tool list, say which step you cannot perform yet and stop before it. Do not improvise around a missing tool. When the user needs something these tools cannot deliver, tell them plainly what is not possible; if it was a real need of theirs that stayed blocked or degraded, record it once with report_capability_gap, relay its user_message (the request went to the Jule team, who are working on it), then say what you did instead.
<!-- /sync:WORKFLOW -->

## Pop-ups

<!-- sync:POPUP -->
What a good pop-up looks like here:
- type "popup". sign_up_config.display_mode "popup" unless the brief asks for inline, banner or bubble. One card (style_config.template "default") unless an image column is wanted (template "2-column", with side on every top-level item).
- Page 1: a heading (text, tag h1), one short paragraph, the inputs the brief needs (an email input with fieldName "email" is the usual minimum; every fieldName unique and stable), and exactly one button at the bottom: action "next" when a later page collects more answers, "submit" when the form ends here. Buttons are the only navigation — a page without a forward button strands the visitor.
- Every further page that collects answers ends with one button: "next", or "submit" on the last one. Submit once per visit: never "submit_and_next" before a page that still collects answers (those answers would be lost); it is only for a thank-you or coupon page that follows.
- Thank-you page (last): a text (or a success_message item with content and errorContent, or a coupon item when the integrations resource shows coupons enabled and a coupon exists in the workspace) and a close or redirect button; no forward action.
- Never set style_config.hide_next, hide_previous or hide_progress: hide_next hides every Next button, yours included.
- Consent: a checkbox input with the consent text as its placeholder when the brief or the region requires it. A phone (tel) input must be paired with a text item that has isSmsDisclaimer true and linkedPhoneInputId pointing at it, using the workspace legal.sms_disclaimer text.
- Backdrop: none by default (no overlay_color, overlay_opacity 0, overlay_blur 0; leave card_shadow at its default, Medium). Only when the brief asks for a dimmed page set overlay_color to an 8-digit hex whose alpha is the dimness, for example "#00000080"; a 6-digit hex is fully opaque and hides the site.
- Settings: leave the trigger fields alone unless the user names a workspace trigger (list_triggers); the dashboard attaches one through trigger_id. Set display_frequency only when asked; the default is until_completed.
- Keep copy short (see best-practices) and check the mobile visibility and responsive overrides of every item.
<!-- /sync:POPUP -->

## Preference centers

<!-- sync:PREFERENCE_CENTER -->
What a preference center is here:
- type "preference_center" with a channels group. The integrations resource must show Iterable connected and active; if it does not, stop and tell the user to connect Iterable in Settings → Integrations first.
- Build the channels group exactly as the item catalog describes: a top-level group with iterableChannelsGroup true and channelConfig.selectedChannels / selectedMessageTypes taken from the integrations resource (ids and names verbatim); one child group per channel (iterableChannelId); one checkbox input per message type inside it (_iterableMessageTypeId, _isChannelToggle); and, when helperCheckbox is set, a helper group (iterableHelperGroup) with select_all / unselect_all checkboxes.
- Add a heading and a short intro above the group and a submit button below it (buttons in a preference center submit).
- style_config: card_width "100%", card_padding "0px", display_mode "whole_page" unless the page will be embedded in another site; preference_center_header_linked and preference_center_footer_linked true to reuse the workspace header and footer; seo_page_title and seo_meta_description filled; notification_enabled true with success and error text.
- settings_config.iterable_integration: enabled true, preference_center_enabled true, channels and message_types mirrored from the integrations resource, actions ["update_profile"]. Ask the user whether visitors arrive from Iterable emails with a signed token (use_token_validation) and which one-click unsubscribe behaviour they want.
- The page is hosted by Jule; a custom domain is set in the dashboard, not in the document.
<!-- /sync:PREFERENCE_CENTER -->

## Landing pages

<!-- sync:LANDING_PAGE -->
What a landing page is here:
- type "preference_center" WITHOUT a channels group; Jule lists such projects as landing pages. It is hosted on Jule's preview domain or on the project's custom domain (set in the dashboard).
- style_config.display_mode "whole_page", card_width "100%", card_padding "0px"; header and footer linked to branding or written in preference_center_header_html / preference_center_footer_html; SEO fields filled (seo_page_title, seo_meta_description, seo_og_image_url).
- Sections are flex items: one Box per section with display "flex" (rows and columns), "grid" (gridTemplateColumns, children placed with gridArea or gridSpanColumns) or "stack" (overlapping children placed with pin, pinOffsetX, pinOffsetY). Give sections htmlId values so header links such as #pricing scroll to them.
- Content is text (headings and copy), logo (images by URL), icon, button (action "redirect" to URLs) and input items inside the Boxes — that is what keeps the page editable, translatable, on-brand, responsive and measurable in the dashboard. An html-block is only for what those items cannot show (embedded video, a third-party widget, a table, custom vector art), never a heading, paragraph, image, link, field, button, section or the page itself; validate and save warn when a block holds page content or form controls. Say which parts fell back to html-block and why.
- A lead form is inputs + a button (action "submit") followed by a success_message item on the same page.
<!-- /sync:LANDING_PAGE -->

## Two rules worth repeating

- **Change only what the brief asks for.** Every style and settings field the brief does not
  mention keeps the editor default listed in the style and settings guides. No effects, shadows,
  overlays, animations or colors nobody asked for — the result should look like what the editor
  produces, plus the brief.
- **No backdrop by default.** A pop-up has no overlay unless the brief asks for a dimmed page; then
  `overlay_color` is an 8-digit hex whose alpha is the dimness (`#00000080`). A 6-digit hex is
  fully opaque and hides the site.

## Changing an existing project

`list_projects` (search by name; when several match, list them and ask) → `get_project` returns
the document in the save shape with `expected_version` → edit → `validate_project_document` →
`save_project_document` with that version (or `patch_project` for a small change). Show the
preview. Publishing, activating, deactivating, archiving and deleting go through
`set_project_status`, which asks for confirmation: show its summary and call again with the
`confirmation_token` only after the user agrees.

## Not through these tools

Inviting or managing users and roles, API keys, custom domains, creating or editing webhook
destinations, the website install snippet and billing live in the Jule dashboard — say so. When a
call fails or data is missing, say so in one sentence, offer the dashboard or Jule support
(support@jule.ai), and move on.
