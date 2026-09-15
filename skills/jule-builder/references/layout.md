# Layout with Boxes

How Jule lays out a page: what a Box (`flex` item) does to its children, how each item type takes
its width, and the layouts real projects are built from. The field list is in
`jule://docs/item-catalog` (`flex`); this guide is the behaviour, measured in the widget. Read it
before placing two things side by side, centring anything, or building a landing page section.

## Two sizing rules

Every page is a column of top-level items; a Box (`type: "flex"`) groups items and lays them out
by `style_info.display` (`flex` with `flexDirection` `column` or `row`, `grid`, `stack`).

1. **In a column** (the page itself, or a Box with `flexDirection: "column"`) every child spans the
   full width: inputs, buttons, images with `width: "100%"`, nested Boxes. A text block spans the
   width too and its `width` is applied as **max-width** (the text wraps earlier, still aligned by
   `textAlign`). A Box with `width: "auto"` still spans the width unless its parent Box sets
   `alignItems` (`flex-start` / `center` / `flex-end`), which lets it hug its content.
2. **In a row** (`flexDirection: "row"`) every direct child sizes to its **content** and never
   grows: an input is about 200px wide, a button as wide as its label, a text as wide as its
   words, an image as wide as its `width`. Only a **nested Box** grows to take the space that is
   left. Children shrink when the row is tight. So `input + button` as direct children of a row
   leaves the rest of the row empty; `Box(input) + button` fills it (recipe 1).

Percent widths work in both directions: `width: "50%"` on a Box or an input takes half the
parent; two Boxes without widths split the row by their content, not equally, so give sibling
columns explicit widths (`"50%"`, `"33.33%"`) or use a grid.

## What each key does, per item

| Key | Box (`flex`) | `text` | `input` / `button` | `logo` / `icon` |
|---|---|---|---|---|
| `width` | width in a row; in a column the Box still spans unless the parent aligns it | **max-width** | width of the control; without it: full width in a column, content width in a row | width of the image |
| `alignSelf` | auto margins on the side(s) — moves a Box that is narrower than its parent (has `width`, `maxWidth`, or a parent with `alignItems`) | no effect: use `textAlign` | positions the control **only when it also has a `width`**; alone it keeps full width | positions the image (it has a width) |
| `margin` | outside spacing; a Box with `margin` and no `width` gets `width: auto` so right margins work | outside spacing | outside spacing | outside spacing |
| `padding` | inside spacing (sections: `"72px 56px"` desktop, `"40px 20px"` mobile) | around the text | inside the control | — |
| `gap` / `rowGap` / `columnGap` | space between children (row, column, grid) | — | — | — |
| `height` | fixed height, `overflow: auto` inside — avoid on Boxes that hold text | **never**: the text scrolls inside | avoid | the image height (with `objectFit`) |
| `minHeight` / `maxWidth` | the safe way to size a Box: `maxWidth: "1100px"` + `alignSelf: "center"` centres a content column | `maxWidth` works like `width` | — | — |
| `backgroundColor` | section band or card (brand refs allowed; `"#ffffff00"` is transparent) | highlight | control background | — |
| `responsive.mobile` | `flexDirection: "column"`, `padding`, `gridTemplateColumns: "1fr"` | `fontSize`, `textAlign` | `width: "100%"` | `width` |

Alignment inside a Box: `alignItems` (cross axis: `center` puts an input and a button on one
baseline in a row; `flex-start` lets children hug their width in a column), `justifyContent`
(main axis: `space-between` pushes a row's first and last child to the edges, `center` centres the
group). A row on a phone: set `responsive.mobile.flexDirection: "column"` on the Box and
`responsive.mobile.width: "100%"` on children that had a percent width.

## Recipes

Placeholder ids (`"form-row"`) become real ids on save; `parent_id` references them. Colors are
`brand:<name>` from `jule://workspaces/{id}/branding`; images are keys from `list_assets`.

**1. Inline form row — input fills, button hugs (the "email + Subscribe" line).**

```json
{ "id": "form-row", "type": "flex", "parent_id": null,
  "style_info": { "flexDirection": "row", "alignItems": "center", "gap": "8px",
                  "responsive": { "mobile": { "flexDirection": "column" } } } },
{ "id": "form-field", "type": "flex", "parent_id": "form-row", "style_info": { "flexDirection": "column" } },
{ "type": "input", "parent_id": "form-field",
  "config": { "fieldName": "email", "inputType": "email", "placeholder": "you@email.com", "required": true } },
{ "type": "button", "parent_id": "form-row", "config": { "label": "Subscribe", "action": "submit" },
  "style_info": { "backgroundColor": "brand:Primary", "color": "#ffffff", "padding": "12px 20px",
                  "responsive": { "mobile": { "width": "100%" } } } }
```

Without `form-field`, the input stays about 200px wide and the row is empty on the right.

**2. Pill — a compact input + button on one rounded background.** The parent Box must stop
stretching (`alignItems`), the pill has `width: "auto"`, the input drops its own border.

```json
{ "id": "copy", "type": "flex", "parent_id": null, "style_info": { "flexDirection": "column", "alignItems": "flex-start", "gap": "12px" } },
{ "id": "pill", "type": "flex", "parent_id": "copy",
  "style_info": { "flexDirection": "row", "alignItems": "center", "gap": "8px", "width": "auto",
                  "padding": "2px", "borderRadius": "10px", "backgroundColor": "#ffffff" } },
{ "type": "input", "parent_id": "pill", "config": { "fieldName": "email", "inputType": "email", "placeholder": "Your business email" },
  "style_info": { "borderWidth": "0px", "backgroundColor": "#ffffff00" } },
{ "type": "button", "parent_id": "pill", "config": { "label": "Get started", "action": "next" },
  "style_info": { "backgroundColor": "brand:Primary", "color": "#ffffff", "borderRadius": "8px", "padding": "12px 18px" } }
```

**3. Two-column hero — copy left, image right, stacked on phones.**

```json
{ "id": "hero", "type": "flex", "parent_id": null, "config": { "htmlId": "hero" },
  "style_info": { "flexDirection": "row", "alignItems": "center", "gap": "40px", "padding": "80px 56px",
                  "backgroundColor": "brand:Bg", "responsive": { "mobile": { "flexDirection": "column", "padding": "40px 20px", "gap": "24px" } } } },
{ "id": "hero-copy", "type": "flex", "parent_id": "hero",
  "style_info": { "flexDirection": "column", "alignItems": "flex-start", "gap": "16px", "width": "50%",
                  "responsive": { "mobile": { "width": "100%" } } } },
{ "type": "text", "parent_id": "hero-copy", "config": { "tag": "h1", "content": "<p>Get paid early</p>" },
  "style_info": { "fontSize": "52px", "fontWeight": "700", "lineHeight": "1.1", "responsive": { "mobile": { "fontSize": "32px" } } } },
{ "type": "text", "parent_id": "hero-copy", "config": { "tag": "p", "content": "<p>Simple invoicing and cash-flow tools.</p>" },
  "style_info": { "fontSize": "18px", "color": "brand:Muted" } },
{ "id": "hero-art", "type": "flex", "parent_id": "hero",
  "style_info": { "flexDirection": "column", "alignItems": "center", "width": "50%", "responsive": { "mobile": { "width": "100%" } } } },
{ "type": "logo", "parent_id": "hero-art", "config": { "imageUrl": "projects/<key>.webp", "altText": "App screens" },
  "style_info": { "width": "100%", "borderRadius": "16px" } }
```

`alignItems: "center"` on `hero` centres the image against the copy vertically. Put the pill
(recipe 2) or the form row (recipe 1) inside `hero-copy`.

**4. Card row — three equal cards, one column on phones.** A grid gives equal columns without
per-card widths; each card is a column Box (bind a card class through `config.presetIds`, see
Style classes in `jule://docs/project-style`).

```json
{ "id": "cards", "type": "flex", "parent_id": "features",
  "style_info": { "display": "grid", "gridTemplateColumns": "1fr 1fr 1fr", "gap": "20px",
                  "responsive": { "mobile": { "gridTemplateColumns": "1fr" } } } },
{ "id": "card-1", "type": "flex", "parent_id": "cards", "config": { "presetIds": ["cls-card"] },
  "style_info": { "flexDirection": "column", "gap": "8px", "padding": "24px", "borderRadius": "16px", "backgroundColor": "#f6f9fb" } },
{ "type": "logo", "parent_id": "card-1", "config": { "imageUrl": "projects/<icon>.webp", "altText": "" }, "style_info": { "width": "64px", "height": "64px" } },
{ "type": "text", "parent_id": "card-1", "config": { "tag": "h3", "content": "<p>Free transfers</p>" }, "style_info": { "fontSize": "24px", "fontWeight": "600" } },
{ "type": "text", "parent_id": "card-1", "config": { "tag": "p", "content": "<p>Schedule recurring payments.</p>" }, "style_info": { "fontSize": "16px", "color": "brand:Muted" } }
```

Two cards of different weight (a stat and an image): `gridTemplateColumns: "1fr 2fr"`. A row Box
with `width: "33.33%"` per card works too, but the grid needs no per-card width.

**5. Centred content column inside a full-width band.** The band paints edge to edge; the inner
Box caps the content width and centres itself.

```json
{ "id": "band", "type": "flex", "parent_id": null, "style_info": { "flexDirection": "column", "padding": "72px 56px", "backgroundColor": "#0b3a44", "responsive": { "mobile": { "padding": "40px 20px" } } } },
{ "id": "band-inner", "type": "flex", "parent_id": "band", "style_info": { "flexDirection": "column", "gap": "20px", "maxWidth": "1100px", "alignSelf": "center" } }
```

`alignSelf: "center"` on a Box is auto margins: it moves the Box only when the Box is narrower
than its parent (`maxWidth`, `width`, or a parent with `alignItems`).

**6. Stat grid.** Three centred figures: a grid of three column Boxes, each `alignItems: "center"`,
a big number (`fontSize: "64px"`) over a label; `maxWidth: "800px"`, `alignSelf: "center"` on the
grid; `responsive.mobile.gridTemplateColumns: "1fr"`.

**7. CTA band — copy left, buttons right, stacked on phones.**

```json
{ "id": "cta", "type": "flex", "parent_id": null,
  "style_info": { "flexDirection": "row", "alignItems": "center", "justifyContent": "space-between", "gap": "32px",
                  "padding": "40px", "borderRadius": "18px", "backgroundColor": "#0b3a44",
                  "responsive": { "mobile": { "flexDirection": "column", "alignItems": "flex-start", "padding": "24px" } } } },
{ "id": "cta-copy", "type": "flex", "parent_id": "cta", "style_info": { "flexDirection": "column", "gap": "12px" } },
{ "id": "cta-actions", "type": "flex", "parent_id": "cta", "style_info": { "flexDirection": "row", "gap": "12px", "width": "auto" } },
{ "type": "button", "parent_id": "cta-actions", "config": { "label": "Get started", "action": "redirect", "redirectUrl": "https://example.com/signup" } },
{ "type": "button", "parent_id": "cta-actions", "config": { "label": "Learn more", "action": "redirect", "redirectUrl": "https://example.com/docs" },
  "style_info": { "backgroundColor": "transparent", "borderWidth": "1px", "borderColor": "#2e6b78", "color": "#ffffff" } }
```

In a row, buttons already hug their labels; `cta-actions` with `width: "auto"` keeps the pair
together on the right while `cta-copy` (a Box) grows.

**8. Text beside an image.** In a row a text hugs its words. Give the text room with
`width: "60%"` (max-width) or wrap it in a Box; size the image with `width`, `borderRadius`,
`objectFit: "cover"`; `alignItems: "center"` aligns them vertically; reverse the order on phones
with `responsive.mobile.flexDirection: "column-reverse"`.

**9. Badge on an image.** A Stack Box: the image (`width: "100%"`) plus a pinned text —
`pin: "top-right"`, `pinOffsetX: "-8px"`, `pinOffsetY: "-8px"`, `stackOrder: "2"`, a background,
`padding: "4px 8px"`, `borderRadius: "999px"`. `clipContents: false` (the default) lets the badge
bleed past the corner.

**10. A narrower button, centred or right-aligned.** Buttons fill a column. `width: "200px"` +
`alignSelf: "center"` centres it; `alignSelf: "flex-end"` right-aligns it; `alignSelf` without a
`width` changes nothing.

## Phones

A row does not stack by itself. For every row Box decide: keep it a row (an input + a button, two
short buttons) or set `responsive.mobile.flexDirection: "column"` and give percent-width children
`responsive.mobile.width: "100%"`. Grids collapse with `responsive.mobile.gridTemplateColumns`.
Section padding shrinks (`"40px 20px"`), headline `fontSize` shrinks (52 → 32px), images get a
mobile `width`, and a decorative image can go with `visibility.hideOnMobile: true`. A pop-up card
wider than 400px needs `style_config.responsive.mobile.card_width` (`"92%"`). Then open the mobile
preview and run the checklist in `jule://docs/responsive`.

## Mistakes the editor never makes

- An input or a button as a **direct child of a row** with other children: it stays content-sized
  (recipe 1 wraps the input in a Box). `validate_project_document` warns about it, except in a
  row with `width: "auto"`, where hugging the content is the point (recipe 2).
- `alignSelf` on an input or button **without a `width`**: no visible change. Add a width or drop it.
- `height` on a text or on a Box that holds text: the content scrolls inside it. Use `padding`,
  `minHeight`, or nothing — Boxes take their height from their children.
- `width` on a text expecting a box: it is a max-width; wrap the text in a Box for a background.
- Two sibling Boxes without widths expecting equal columns: they split by content. Use a grid or
  percent widths.
- A centred Box that never centres: `alignSelf` needs the Box to be narrower than its parent.
- Every element styled by hand when the workspace has classes: read `element_presets` in the
  branding resource and bind them (`config.presetIds`), see `jule://docs/project-style`.
- Layout hacks in `customCss` (`position`, negative `top`, `margin-bottom: -150px`): fragile and
  invisible in the editor panels; reach for a Stack Box with `pin` and offsets instead.
