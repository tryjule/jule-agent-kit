# Figma → Jule Mapping

Jule ships no Figma code. The agent reads the design through **Figma's own MCP server** (design
context, metadata, variables, screenshots for comparison only) and writes a Jule project document
with the rules below. The 13 item types cannot represent arbitrary designs, so an import is an
**approximate mapping**: list what did not map before saving. Read `jule://docs/item-catalog` for
every field named here.

## Ground rules

1. **Measure from data, never from pixels.** Take structure, `layoutMode`, padding, `itemSpacing`,
   alignment, sizes, fills, strokes, corner radii, effects and text styles from the design-context /
   node data. A screenshot is for comparing the Jule preview with the design afterwards.
2. **Structure follows the tree.** A frame is a container; its nesting is the item nesting
   (`parent_id`). Do not turn child x/y coordinates into margins — use the parent's layout mode.
3. **Reuse the workspace.** Match Figma variables and color styles to `brand_color_groups` in
   `jule://workspaces/{id}/branding` by value and write `brand:<name>`; match font families to
   branding `fonts` (`fontFamily` + `fontUrl`); use branding `logos` and the icon library.
4. **One Figma frame per Jule page.** A flow of frames becomes pages in order; buttons that link
   frames become `button` items with `action: "next"` / `targetPageId`.

## Node → item rules

| Figma node                                                        | Jule item                                                            | Fields                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame with auto-layout (`layoutMode` HORIZONTAL / VERTICAL)       | `flex` with `display: "flex"`                                        | `flexDirection: "row" \| "column"`, `gap` from `itemSpacing` (or `rowGap` / `columnGap` when they differ), `padding` from the four paddings, `alignItems` from counter-axis alignment (MIN→`flex-start`, CENTER→`center`, MAX→`flex-end`, STRETCH→`stretch`), `justifyContent` from primary-axis alignment (SPACE_BETWEEN→`space-between`), `flexWrap: "wrap"` when wrapping is on                        |
| Frame whose children overlap (no auto-layout, absolute children)  | `flex` with `display: "stack"`                                       | each child gets `pin` (nearest of the nine anchors from its constraints/position), `pinOffsetX` / `pinOffsetY` (distance from that edge, negative when it bleeds out), `stackOrder` from z-order; `clipContents: true` when the frame clips                                                                                                                                                               |
| Frame with a grid layout or a repeating row/column of equal cells | `flex` with `display: "grid"`                                        | `gridTemplateColumns` (`"1fr 1fr 1fr"` or `minmax(0, 320px)` tracks), `gridTemplateRows`, `gap`; children with `gridArea` / `gridSpanColumns`; add `responsive.mobile.gridTemplateColumns: "1fr"`                                                                                                                                                                                                         |
| Top navigation bar or site footer frame (the chrome around the screens, repeated in the design) | `preference_center_header_html` / `preference_center_footer_html` (+ `_css`, `_js`) | not items and not an `html-block`: the navbar and the footer are project chrome, written as plain HTML in `style_config` and rendered above and below the card on every page. Set `preference_center_header_linked` / `preference_center_footer_linked: true` instead when the workspace branding already carries one. Menu links to sections: `<a href="#pricing">` with `config.htmlId: "pricing"` on that section Box; a menu toggle goes in `_js` (the HTML is sanitized, so inline handlers are stripped) |
| Section / page-level frame                                        | one `flex` per section with `config.htmlId` (slug of the layer name) | background fills → `backgroundColor` / `backgroundImage`, `padding`, `maxWidth` when the content is centred in a wider frame                                                                                                                                                                                                                                                                              |
| Text node                                                         | `text`                                                               | `tag` by hierarchy (largest heading `h1`, then `h2`, `h3`, body `p`, inline `span`, link `a` + `href`); `content` as `<p>…</p>` (bold runs → `<strong>`); `fontSize` px, `fontWeight` (400/500/600/700), `fontFamily` + `fontUrl` when the design's font is a workspace font or is on Google Fonts, `lineHeight` (px or unitless), `letterSpacing` px, `color`, `textAlign`; a fixed-width text box → `width` (Jule applies it as `max-width`) |
| Button-looking component (frame with a label, fill, radius)       | `button`                                                             | `label` from the text child, `action` from the prototype link (`next` to another frame, `redirect` + `redirectUrl` to a URL, `submit` when it ends a form), `backgroundColor`, `color`, `padding`, `borderRadius`, `borderWidth` / `borderColor`, `fontSize` / `fontWeight`; an icon child → `startIcon` / `endIcon` from the library                                                                     |
| Text-field component (placeholder text inside a stroked box)      | `input`                                                              | `inputType` from the placeholder/label meaning (`email`, `tel`, `text`, `textarea`, `date`, `number`), `fieldName` a snake_case slug of the label, `placeholder`, `required` when the label has `*`; box styles from the field frame                                                                                                                                                                      |
| Checkbox + label row                                              | `input` with `inputType: "checkbox"`                                 | label → `placeholder`; check color → `checkColor`; a switch look → `checkboxVariant: "switch"`                                                                                                                                                                                                                                                                                                            |
| Radio list / segmented cards                                      | `input` with `inputType: "radio"` or `"single-select"`               | `options` from the row labels, `renderAs` (`radio` dot, `tick`, `ab` letters, `button` plain cards), `activeBackground` / `activeColor` / `activeBorderColor` from the selected state, `optionGap`                                                                                                                                                                                                        |
| Star / heart row                                                  | `rating`                                                             | `maxRating` = count, `iconType`, `size`, selected/unselected fill and stroke colors                                                                                                                                                                                                                                                                                                                       |
| Image / rectangle with image fill                                 | `logo`                                                               | needs a hosted URL: a branding logo (`logo`), an existing https image (`imageUrl`); otherwise tell the user to upload it. `width`, `height`, `objectFit: "cover"` for photos, `borderRadius`                                                                                                                                                                                                              |
| Vector / icon instance                                            | `icon`                                                               | only when the workspace icon library contains it (copy `svg` + `viewBox`, set `size`, `color: "brand:…"`); otherwise inline the SVG in an `html-block` or drop it                                                                                                                                                                                                                                         |
| Divider line                                                      | `flex` with `height: "1px"`, `backgroundColor`                       | or a `text` with `borderWidth` — Jule has no divider type                                                                                                                                                                                                                                                                                                                                                 |
| Badge / pill text                                                 | `text` with `tag: "span"`                                            | `backgroundColor`, `padding`, `borderRadius: "999px"`, pinned inside a Stack when it overlaps                                                                                                                                                                                                                                                                                                             |
| Embedded video, third-party widget, table, complex vector art — one node, after everything above is mapped | `html-block` | never a frame, section or screen that holds text, images, buttons or fields (map those to items first); note each block in the summary; approximate fidelity |

Effects: a drop shadow → `boxShadow` (`"0 10px 15px -3px rgba(0,0,0,0.1)"`); layer opacity →
`opacity`; a stroke → `borderWidth` + `borderColor` + `borderStyle: "solid"`; corner radius →
`borderRadius`. Blur and blend modes have no equivalent.

Card-level properties go to `style_config`: the pop-up frame's size → `card_width` / `card_height`
(`auto` when content-sized), its padding → `card_padding`, radius → `border_radius`, fill →
`background_color` / `background_image`, shadow → the closest `card_shadow` preset (`None`,
`Small`, `Medium`, `Large`), a scrim behind it → `overlay_color` + `overlay_opacity`. A two-panel
pop-up (image left, form right) is `template: "2-column"` with `left_column_image`,
`left_column_width` and `side` on every top-level item.

Text styles shared across the design set the project defaults (`font_family`, `title_font_size`,
`desc_font_size`, `primary_color`) so items can leave their own fields empty.

## Worked example 1 — newsletter pop-up

Figma: frame "Newsletter" 400×auto, vertical auto-layout, padding 24, spacing 16, fill #FFFFFF,
radius 12, drop shadow. Children: logo (image 120×32), "Get 10% off" (Inter 700 28px, #111827),
"Join the list for early access." (Inter 400 16px, #4B5563), an email field (placeholder
"you@example.com", stroke #D1D5DB radius 6), a button "Get my code" (fill variable Brand/Primary,
white text, radius 6, padding 12 20). Variable Brand/Primary = #7C3AED = branding color "Primary".

```json
{
  "expected_version": 1,
  "name": "Newsletter",
  "style_config": {
    "template": "default",
    "position": "center",
    "card_width": "400px",
    "card_height": "auto",
    "card_padding": "24px",
    "border_radius": "12px",
    "background_type": "color",
    "background_color": "#ffffff",
    "card_shadow": "Medium",
    "primary_color": "brand:Primary",
    "font_family": "Inter",
    "font_family_url": "https://…/inter.css",
    "hide_next": true,
    "hide_previous": true,
    "hide_progress": true
  },
  "settings_config": { "sign_up_config": { "display_mode": "popup" } },
  "pages": [
    {
      "title": "Sign up",
      "items": [
        {
          "id": "stack",
          "type": "flex",
          "parent_id": null,
          "style_info": {
            "display": "flex",
            "flexDirection": "column",
            "gap": "16px",
            "alignItems": "stretch"
          }
        },
        {
          "type": "logo",
          "parent_id": "stack",
          "config": {
            "logo": { "id": "l1", "name": "acme.svg", "url": "logos/acme.svg" },
            "isWorkspaceLogo": true,
            "altText": "Acme"
          },
          "style_info": {
            "width": "120px",
            "height": "32px",
            "objectFit": "contain"
          }
        },
        {
          "type": "text",
          "parent_id": "stack",
          "config": { "tag": "h1", "content": "<p>Get 10% off</p>" },
          "style_info": {
            "fontSize": "28px",
            "fontWeight": "700",
            "color": "#111827",
            "lineHeight": "1.2"
          }
        },
        {
          "type": "text",
          "parent_id": "stack",
          "config": {
            "tag": "p",
            "content": "<p>Join the list for early access.</p>"
          },
          "style_info": { "fontSize": "16px", "color": "#4b5563" }
        },
        {
          "type": "input",
          "parent_id": "stack",
          "config": {
            "fieldName": "email",
            "inputType": "email",
            "placeholder": "you@example.com",
            "required": true
          },
          "style_info": {
            "borderWidth": "1px",
            "borderColor": "#d1d5db",
            "borderStyle": "solid",
            "borderRadius": "6px",
            "padding": "12px"
          }
        },
        {
          "type": "button",
          "parent_id": "stack",
          "config": { "label": "Get my code", "action": "submit_and_next" },
          "style_info": {
            "backgroundColor": "brand:Primary",
            "color": "#ffffff",
            "borderRadius": "6px",
            "padding": "12px 20px",
            "fontWeight": "600"
          }
        }
      ]
    },
    {
      "title": "Thanks",
      "items": [
        {
          "type": "text",
          "parent_id": null,
          "config": { "tag": "h2", "content": "<p>Check your inbox</p>" },
          "style_info": { "fontSize": "24px", "fontWeight": "700" }
        },
        {
          "type": "success_message",
          "parent_id": null,
          "config": {
            "tag": "p",
            "content": "<p>Your code is on its way.</p>",
            "errorContent": "<p>Something went wrong. Please try again.</p>"
          },
          "style_info": { "color": "#047857" },
          "error_style_info": { "color": "#dc2626" }
        },
        {
          "type": "button",
          "parent_id": null,
          "config": { "label": "Close", "action": "close" },
          "style_info": {
            "backgroundColor": "transparent",
            "color": "brand:Primary",
            "borderWidth": "1px",
            "borderColor": "brand:Primary",
            "borderRadius": "6px",
            "padding": "12px 20px"
          }
        }
      ]
    }
  ]
}
```

Not mapped: the shadow's exact blur (preset `Medium` used); the logo must already exist in
branding.

## Worked example 2 — hero section with an overlapping badge (landing page)

Figma: frame "Hero" 1200×560, horizontal auto-layout, spacing 48, padding 64; left frame
(vertical, spacing 24: headline 48px, paragraph 18px, button); right frame 520×400 with a photo and
a "New" pill positioned 12px outside the top-right corner.

```json
[
  {
    "id": "hero",
    "type": "flex",
    "parent_id": null,
    "config": { "htmlId": "hero" },
    "style_info": {
      "display": "grid",
      "gridTemplateColumns": "1fr 1fr",
      "columnGap": "48px",
      "alignItems": "center",
      "padding": "64px",
      "maxWidth": "1200px",
      "margin": "0 auto",
      "responsive": {
        "mobile": { "gridTemplateColumns": "1fr", "padding": "24px" }
      }
    }
  },
  {
    "id": "copy",
    "type": "flex",
    "parent_id": "hero",
    "style_info": {
      "display": "flex",
      "flexDirection": "column",
      "gap": "24px",
      "alignItems": "flex-start"
    }
  },
  {
    "type": "text",
    "parent_id": "copy",
    "config": {
      "tag": "h1",
      "content": "<p>Ship preferences your customers control</p>"
    },
    "style_info": {
      "fontSize": "48px",
      "fontWeight": "700",
      "lineHeight": "1.1",
      "color": "brand:Ink"
    }
  },
  {
    "type": "text",
    "parent_id": "copy",
    "config": { "tag": "p", "content": "<p>One page for every channel.</p>" },
    "style_info": { "fontSize": "18px", "color": "#4b5563" }
  },
  {
    "type": "button",
    "parent_id": "copy",
    "config": {
      "label": "Book a demo",
      "action": "redirect",
      "redirectUrl": "https://example.com/demo"
    },
    "style_info": {
      "backgroundColor": "brand:Primary",
      "color": "#ffffff",
      "padding": "14px 24px",
      "borderRadius": "8px"
    }
  },
  {
    "id": "art",
    "type": "flex",
    "parent_id": "hero",
    "style_info": { "display": "stack", "clipContents": false }
  },
  {
    "type": "logo",
    "parent_id": "art",
    "config": {
      "imageUrl": "https://cdn.example.com/hero.jpg",
      "altText": "Preference center on a laptop"
    },
    "style_info": {
      "width": "100%",
      "height": "400px",
      "objectFit": "cover",
      "borderRadius": "16px"
    }
  },
  {
    "type": "text",
    "parent_id": "art",
    "config": { "tag": "span", "content": "New" },
    "style_info": {
      "pin": "top-right",
      "pinOffsetX": "-12px",
      "pinOffsetY": "-12px",
      "stackOrder": "2",
      "backgroundColor": "brand:Accent",
      "color": "#ffffff",
      "fontSize": "12px",
      "fontWeight": "600",
      "padding": "4px 10px",
      "borderRadius": "999px"
    }
  }
]
```

Two columns became a Grid so the section stacks on phones; the left frame's auto-layout became a
flex Box; the overlap became a Stack with a pinned badge (negative offsets bleed outward, and do
not change layout). The photo needs a hosted URL.

## Worked example 3 — option cards

Figma: three horizontally laid out cards "Starter / Pro / Team", each a stroked frame with a
title, selected state fill Brand/Primary with white text. Jule has no card component; this is one
`input`:

```json
{
  "type": "input",
  "parent_id": null,
  "config": {
    "fieldName": "plan",
    "inputType": "single-select",
    "renderAs": "button",
    "options": [
      { "value": "starter", "label": "Starter" },
      { "value": "pro", "label": "Pro" },
      { "value": "team", "label": "Team" }
    ]
  },
  "style_info": {
    "optionGap": "12px",
    "borderWidth": "1px",
    "borderColor": "#d1d5db",
    "borderRadius": "12px",
    "padding": "16px",
    "activeBackground": "brand:Primary",
    "activeColor": "#ffffff",
    "activeBorderColor": "brand:Primary"
  }
}
```

Per-card icons or prices inside each option cannot be expressed; either drop them or use three
Boxes with a `button` each (`action: "next"`, `targetPageId`) when each card leads somewhere.

## What does not map

- Absolute positioning outside a Stack Box; rotation; blend modes; blur effects; masks; gradients on
  text (supported only through brand gradient colors); component variants and interactions beyond
  page navigation and URL links; hover states other than the option-card hover; videos; tables;
  forms with more than one submit target per page.
- Fonts render with the visitor's fallback unless you provide `fontUrl` — a workspace font from
  branding, or the design's font on Google Fonts.
- Images and icons need hosted URLs or library entries; upload the design's real exports with
  `upload_branding_asset` rather than leaving a placeholder.

State these in the summary so the user knows where to finish by hand in the editor.
