# Jule Responsive Guide

A Jule project is one document rendered at three widths. The editor's device toggle (Desktop,
Tablet, Mobile) and the preview links (`preview_project` with `device: desktop | tablet | mobile`,
or `&device=` on the link) show the same three renderings the widget produces on a visitor's
screen. Nothing is generated per device: the widget reads the desktop values and applies the
tablet and mobile overrides on top. This guide says what those overrides can change, what the
widget already does on phones by itself, and what to check before calling a project done.

## Breakpoints

| Device  | Viewport          | Editor frame                     | Preview                          |
| ------- | ----------------- | -------------------------------- | -------------------------------- |
| Desktop | wider than 1024px | full canvas                      | `device: "desktop"` (default)    |
| Tablet  | 769px – 1024px    | 820px screen                     | `device: "tablet"`               |
| Mobile  | up to 768px       | 402px phone frame (374px screen) | `device: "mobile"` (390px frame) |

The same numbers gate item visibility (`visibility.hideOnMobile` ≤768px, `hideOnTablet`
769–1024px, `hideOnDesktop` ≥1025px) and the `responsive.tablet` / `responsive.mobile` buckets.

## How overrides cascade

- **Project level** — `style_config.responsive.tablet` and `style_config.responsive.mobile` are
  partial `ProjectStyleInfo` objects. Only these fields are honoured: `card_width`,
  `card_max_width`, `card_height`, `card_padding`, `justify_content`, `body_flex_direction`,
  `body_align_items`, `title_font_size`, `title_text_align`, `desc_font_size`, `desc_text_align`,
  `button_font_size`, `button_padding`, `input_font_size`, `input_padding`, `column_gap`,
  `left_column_width` (ignored on mobile, where the columns stack), `left_column_padding`,
  `right_column_padding`. Any other key in a bucket is stored but changes nothing.
- **Item level** — `style_info.responsive.tablet` and `style_info.responsive.mobile` are partial
  `ItemStyleInfo` objects. The widget honours these 31 fields per breakpoint: `width`, `height`,
  `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `padding`, `margin`, `gap`, `rowGap`,
  `columnGap`, `alignSelf`, `textAlign`, `fontSize`, `lineHeight`, `flexDirection`, `alignItems`,
  `justifyContent`, `flexWrap`, `backgroundSize`, `backgroundPosition`, `pin`, `pinOffsetX`,
  `pinOffsetY`, `stackOrder`, `gridTemplateColumns`, `gridTemplateRows`, `gridTemplateAreas`,
  `gridArea`, `gridSpanColumns`, `gridSpanRows`. Colors, fonts, borders, radii and `display` are
  not per-breakpoint (the editor writes them to the base style even with Tablet or Mobile
  selected). A Box keeps its layout mode (`display`) at every width — you change its tracks, not
  its kind. A pinned Stack child that overrides one of `pin`,
  `pinOffsetX`, `pinOffsetY` resolves all three at that width; the same holds for `gridArea`,
  `gridSpanColumns`, `gridSpanRows`.
- **Cascade** — desktop is the base. Tablet = base + `tablet`. Mobile = base + `tablet` + `mobile`
  (mobile inherits every tablet override it does not set itself). A bucket holds only the fields
  that differ; never copy the whole style into it.
- **Visibility** — `visibility` is per item; children of a hidden Box or group are hidden with it.
  Hiding is `display: none`: a hidden item still counts for nothing (no validation, no submit
  value), so never hide a required input on one device.
- **Two-column popups** — the columns stack on phones (`mobile_column_layout: "stacked"`,
  `mobile_column_order: "left-first"` by default); `mobile_hide_left_column` /
  `mobile_hide_right_column` drop a column; `left_column_width` has no effect at phone width.
- **Teaser / bubble** — one size at every width (no responsive fields); a `rectangle` at
  `center-left` / `center-right` is rotated at every width, keep `bubble_text` short. Top
  teasers sit below the phone status bar in the editor's mobile frame.

## What the widget does on phones by itself

At ≤768px the widget already: caps the card at 95vw (fullscreen popups fill the screen), moves
corner positions 10px from the edges, pads the card 16px and scrolls it, clamps default text to
`clamp(12px, 4vw, 16px)`, `h1` to 20–28px, `h2` 18–24px, `h3` 16–20px, sets inputs to 16px / 12px
padding (16px stops iOS from zooming the page on focus), makes buttons full-width at 14px, and
caps a `logo` at 80% width / 60px height. An explicit `fontSize` on an item wins over the clamp, so
a 12px legal text stays 12px — check it is still readable.

## The rendered review

After every save call `preview_project` with `device: "all"` and `review: true`. Jule renders the
draft at the three widths, returns a picture of the card per device (look at them) and lists what
it measured: items running past the card edge, text scrolling inside its box, a card that scrolls
sideways, images that filled the desktop card but float small on tablet or phone, row Boxes left
mostly empty, text under 14px and tap targets under 40px on the phone. Fix every line, save and
review again until every device comes back clean; then walk the checklist below for what a
measurement cannot see (order, wording, contrast, what is hidden). When the review answers
`available: false`, the checklist is all you have: run it against the document and ask the user
to open the phone link.

## The mobile checklist

Open the mobile preview (`preview_project` → `device: "mobile"`, or `device: "all"` for the three
links) after every save that changes layout, and before you tell the user the project is done.
Look for:

1. **Grids** — every `flex` item with `display: "grid"` and more than one column needs
   `style_info.responsive.mobile.gridTemplateColumns: "1fr"` (or a two-column track for small
   cards); otherwise the columns squeeze into 390px. Remove `gridTemplateAreas` in the same bucket
   when the desktop map names more columns than the mobile tracks have, or provide a one-column
   map. `validate_project_document` warns about a multi-column grid without a mobile track list.
2. **Card width** — a popup `card_width` above 400px needs `style_config.responsive.mobile.card_width`
   (`"92%"` or `"100%"`); the widget's 95vw cap keeps it on screen but the padding and columns do
   not adapt. Landing pages and preference centers use `"100%"` at every width.
3. **Font sizes** — anything below 14px on mobile is hard to read; check `fontSize` overrides and
   the disclaimer / consent texts (12px legal text is the common offender). Headlines above 32px
   wrap into three lines on a phone; give an `h1` a mobile `fontSize` of 24–28px.
4. **Fixed heights** — a `height` on a `text`, `button`, `input`, `success_message` or `html-block`
   item clips or scrolls when the text wraps on a narrower screen; use `minHeight` or none.
5. **Hidden items** — check `hideOnMobile` / `hideOnTablet` / `hideOnDesktop` never hide the only
   forward button, a required input or the whole page on one device; decorative images and side
   texts are what to hide.
6. **Images** — `logo` items with a fixed `width` above 300px need a mobile `width` (`"100%"`) and
   `objectFit: "contain"` (or `"cover"` for a hero) so they neither overflow nor distort; a
   two-column popup with an image column usually sets `mobile_hide_right_column` (or left).
7. **Two-column stacking** — with `mobile_column_layout: "stacked"` the image column comes first
   when it is the left one; put the form first with `mobile_column_order: "right-first"` or hide
   the image column.
8. **Teaser on mobile** — a rectangle teaser wider than 200px covers the content on a phone; keep
   `bubble_width` ≤ 200 or use the `circle` shape; bottom-anchored teasers are the safest.
9. **Buttons and inputs** — the widget makes buttons full width on phones; a button with a fixed
   `width` in px overrides that, so prefer `alignSelf` for placement and no width.
10. **Tablet** — usually inherits desktop unchanged; check only two-column popups (columns stay
    side by side at 820px) and grids of four or more columns (`responsive.tablet.gridTemplateColumns`
    with two columns).

## Recording what you checked

When you can open the previews, say what you looked at on each device (pages, cut-off text,
overlaps, unreadable sizes) and what you changed. When you cannot open a page, give the user the
three links and ask them to check the phone one — never claim it looks right unseen.
