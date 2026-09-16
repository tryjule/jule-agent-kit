# Jule Project Style Guide

Project-level appearance lives in two places of the document: `style_config` (a
`ProjectStyleInfo`, every card/typography/overlay/header/SEO field) and the display half of
`settings_config.sign_up_config` (how a popup is embedded: pop-up, inline, banner, bubble; teaser
and bubble looks). Item-level styles are in `jule://docs/item-catalog`. Field names, types and
one-line descriptions are in the schema part `jule://docs/schema/style_config` (or `whoami` with
`doc: "document-schema"`, `section: "style_config"`); this guide says what the editor calls
each group, when it is shown, and how the widget applies it.

Colors accept `brand:<name>` references to the workspace brand colors (see the item catalog).
Lengths are CSS strings. Image fields: `background_image`, `left_column_image` and
`right_column_image` accept the stored key `list_assets` returns as `url` (the widget resolves
it, as it does for `logo` items) or any https URL; `bubble_bg_image_url`,
`bubble_custom_icon_url`, `seo_favicon_url` and `seo_og_image_url` are used verbatim, so give
them the full address (`public_url` from `list_assets` or the branding `logos[]`, or a hosted
https URL). `responsive.tablet` / `responsive.mobile` hold partial overrides for
≤1024px / ≤768px of the layout and typography-size fields only: `card_width`, `card_max_width`,
`card_height`, `card_padding`, `justify_content`, `body_flex_direction`, `body_align_items`, the
title/desc/button/input font sizes and alignments, button/input padding, `column_gap`,
`left_column_width` and the column paddings (`left_column_padding`, `right_column_padding`).
How the three device widths cascade, and the phone checklist, are in `jule://docs/responsive`.

## Which panels exist for which project

The editor's Styles tab shows these sections (labels as in the UI):

| Section                                        | Shown for                                  | Fields                                                                                  |
| ---------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| Display settings                               | popups (not preference centers)            | `sign_up_config.display_mode`, `banner_position`, `style_config.template`, `position`   |
| Two column settings, Left column, Right column | popups with `template: "2-column"`         | `left_column_*`, `right_column_*`, `column_gap`, `mobile_*`                             |
| Teaser                                         | popups in `popup` or `bubble` display mode | `sign_up_config.teaser_*` and `bubble_*`                                                |
| Card styles                                    | every project                              | card box, background, border, typography and button/input defaults, built-in navigation |
| Effect                                         | popups                                     | `overlay_color`, `overlay_opacity`, `overlay_blur`, `card_shadow`                       |
| Close button                                   | popups in popup/bubble/banner mode         | `close_button_*`                                                                        |
| Header & Footer                                | preference centers and landing pages       | `preference_center_header_*`, `preference_center_footer_*`, `*_linked`                  |
| SEO settings                                   | preference centers and landing pages       | `seo_*`                                                                                 |
| Notification settings                          | preference centers                         | `notification_*`                                                                        |
| Display Mode (settings)                        | preference centers and landing pages       | `display_mode` (`whole_page` / `container_based`)                                       |

"Preference center" here means `type: "preference_center"` — both real preference centers and
landing pages (a preference-center project with no channels group).

## Display settings (`sign_up_config.display_mode`, template, position)

- `display_mode`: `popup` (modal card over the page, default), `inline` (rendered in the page flow
  where the embed snippet sits; triggers based on delay/scroll/exit are ignored and behavioural
  targeting conditions are disabled), `banner` (edge bar; `banner_position` `top` | `bottom`,
  `banner_align_items`, `banner_show_close_button`), `bubble` (a floating button that opens the
  popup; styled by the teaser fields below). Editor labels: Pop-up, Inline, Banner; bubble is
  reached through the Teaser panel.
- `style_config.template`: `default` (one column) or `2-column` (items placed by `side`). Editor:
  "1 Column" / "2 Column".
- `style_config.position` (popup mode): nine anchors `top-left … bottom-right`, default `center`.
  Editor: Popup position grid.
- `body_flex_direction` (banners default to `row`, everything else `column`), `justify_content`
  (default `center`), `body_align_items` control the card body.

## Teaser and bubble (`sign_up_config.teaser_*`, `bubble_*`)

The teaser is the small button that re-opens a closed popup or invites the visitor before the
form; in bubble mode it is the bubble itself. The widget resolves one config from both field
families:

- `teaser_enabled`, `teaser_display_setting`: `after_close` (default; shows 2 s after the popup is
  closed), `before_form`, `before_and_after`. Editor labels: "Show after form is closed", "Show
  before displaying form", "Show before and after".
- `teaser_style`: `circle` (default) or `rectangle`; `teaser_position` (nine anchors, default from
  `bubble_position` → `bottom-right`); `teaser_width` / `bubble_width`, `bubble_height`,
  `bubble_size` (60px default); a rectangle at `center-left` / `center-right` is rotated so the
  text reads vertically (`teaser_mirror_text` flips it).
- `teaser_anchored` (default true): the popup opens beside the teaser instead of at `position`.
- `teaser_show_close_button`, `teaser_mirror_text` (teaser text mirrors the first heading).
- Appearance: `bubble_text` (translatable via `sign_up_config.i18n`), `bubble_text_color`,
  `bubble_text_font_size`, `bubble_text_font_weight` (300–700; editor Light…Bold),
  `bubble_text_font_family` + `bubble_text_font_url`, `bubble_text_letter_spacing`,
  `bubble_text_line_height`, `bubble_text_align`, `bubble_icon_bg_color` (defaults to the project
  primary color), `bubble_bg_image_url`, `bubble_custom_icon_url` + `bubble_icon_type: "custom"` +
  `bubble_icon_size`, `bubble_border_radius` (30 default) or the four per-corner radii
  `bubble_border_radius_top_left`, `bubble_border_radius_top_right`,
  `bubble_border_radius_bottom_right`, `bubble_border_radius_bottom_left` (px; a corner value wins
  over the shared radius), and the distance from the screen edge in px: `bubble_margin_top`,
  `bubble_margin_bottom`, `bubble_margin_left`, `bubble_margin_right` (only the two that match the
  anchor apply — a `bottom-right` teaser reads bottom and right).
- Shape memory: `teaser_saved_rect_width`, `teaser_saved_rect_height` and
  `teaser_saved_circle_size` are what the editor remembers when the user toggles between
  `rectangle` and `circle`, so switching back restores the last size. The widget never reads them.
  Send them equal to the current `bubble_width` / `bubble_height` / `bubble_size` (or omit them);
  the editor fills them on the first shape toggle.

## Card styles (`style_config`)

- Box: `card_width` (400px default; `100%` for preference centers), `card_max_width`,
  `card_height` (`auto`), `card_padding` (20px; `0px` for preference centers), `border_radius`
  (12px), `card_border_width` / `card_border_color` / `card_border_style`, `card_custom_css`
  (raw CSS appended to the card).
- Background: `background_type` `color` | `image`, `background_color` (`#ffffff`),
  `background_image`, `background_object_fit`, `background_repeat`, `background_position`.
- Typography defaults used by items that set none: `font_family` + `font_family_url` (the workspace
  font, or any font stylesheet URL — a Google Fonts CSS2 URL works), `font_weight`, `title_font_size` (30px) / `title_text_align` / `title_color`,
  `desc_font_size` (16px) / `desc_text_align` / `desc_color` (`#111827`), `primary_color`
  (`#7c3aed`; buttons, focus states, selected option cards, teaser background).
- Button and input defaults: `button_radius`, `button_padding`, `button_font_size`,
  `button_text_color`, `input_radius`, `input_padding`, `input_font_size`, `input_text_color`.
- Navigation is done with `button` items; there is no separate built-in bar. `hide_next` /
  `hide_previous` hide **every** button item whose action is `next` / `previous`, including the
  ones in the document — `hide_next: true` leaves visitors unable to advance. Leave both unset
  (no real project sets them). `hide_progress`, `previous_button_text`, `next_button_text` and
  `submit_button_text` are legacy fields with no effect: the widget renders no progress bar and no
  built-in pager, so "Weiter / Zurück" pager text is the `label` (and `i18n`) of your own `button`
  items, never these fields. Omit them.
- Loading spinner during submit: `loading_spinner_enabled` (default on), `loading_spinner_color`,
  `loading_spinner_size`.

## Effect (`overlay_*`, `card_shadow`)

The backdrop behind a popup or bubble. The editor default is **no backdrop**: no `overlay_color`,
`overlay_opacity: 0`, `overlay_blur: 0`. Keep it that way unless the brief asks for a dimmed or
blurred page — a backdrop is a design choice the user makes, not something to add for polish. When
one is wanted, the common real-world setting is a light dim (`overlay_opacity: 10`, `overlay_blur: 6`).

- `overlay_color` — the backdrop as `#rrggbbaa`; the **alpha byte is the dimness**
  (`#00000080` = 50% black). A 6-digit hex such as `#000000` has no alpha and is painted fully
  opaque: the whole site disappears behind the card. `validate_project_document` warns about it.
- `overlay_opacity` — legacy, 0–100 (percent of black, not 0–1). Ignored when `overlay_color` is
  set; the editor mirrors the alpha into it. Send `0` (the default) and express dimness through
  `overlay_color`.
- `overlay_blur` — px of backdrop blur, default 0.
- `card_shadow` — a preset name, `None`, `Small`, `Medium` (default) or `Large`, mapped to fixed
  box-shadows by the widget. Raw CSS is not accepted: anything else renders as Medium.

## Close button (`close_button_*`)

`close_button_size` (16px), `close_button_color` (`#111827`), `close_button_bg_color`
(transparent), `close_button_border_radius` (0), `close_button_padding` (0). The button is
rendered by the card for popup/bubble/banner modes; `banner_show_close_button: false` removes it
from banners.

## Two-column layout (`template: "2-column"`)

Every top-level item needs `side`. Left column: `left_column_width` (`"50"` = percent in the editor,
CSS lengths also work), `left_column_bg_type` + `left_column_bg` / `left_column_image` +
`left_column_object_fit`, `left_column_padding`, and a text shown only when the column has no
items: `left_column_text` with `left_column_text_color`, `left_column_font_size`,
`left_column_font_weight`, `left_column_text_align`, `left_column_line_height`,
`left_column_font_family`. Right column: `right_column_bg_type` (`color` | `image`) with
`right_column_bg` (color) or `right_column_image` (URL) + `right_column_object_fit` (`cover`
default, `contain`, `fill`, `none`), and `right_column_padding`; there is no `right_column_text`
— the right column shows its items only. `column_gap` between the columns. A right-column image
popup is `template: "2-column"`, `right_column_bg_type: "image"`, `right_column_image: <url>`,
`right_column_object_fit: "cover"`, every content item `side: "left"`, and usually
`mobile_hide_right_column: true` so the picture does not push the form below the fold on phones. Mobile: `mobile_column_layout` (`stacked` default | `side-by-side`),
`mobile_column_order` (`left-first` | `right-first`), `mobile_hide_left_column`,
`mobile_hide_right_column`. The editor sets `card_padding: "0px"` for image columns; with the
`default` template these fields are ignored.

## Preference center and landing page chrome

- `display_mode`: `whole_page` (full-page experience, default) or `container_based` (an embeddable
  container that fits the host page). Editor: Display Mode → Whole Page / Container Based.
- Header and footer: `preference_center_header_html`, `preference_center_header_css`,
  `preference_center_header_js` and `preference_center_footer_html`,
  `preference_center_footer_css`, `preference_center_footer_js` render above and below the card.
  The HTML is sanitized (scripts and event handlers stripped), the CSS is injected as a stylesheet
  next to the block (write plain selectors; it is not scoped), and the JS runs once after the block
  is in the DOM (an IIFE; use it for menu toggles, not for loading third-party scripts).
  `preference_center_header_linked` / `preference_center_footer_linked: true` make the project
  follow the workspace branding header/footer: Jule rewrites the project's HTML/CSS/JS from
  branding on save and whenever branding changes (and can push it to the published snapshot).
  Header links to page sections: write `<a href="#pricing">` and give the target Box
  `config.htmlId: "pricing"`. The navbar and the footer are never Boxes and text items: validate
  warns when the first section holds a logo and menu links or the last one holds the site links
  and legal line.
- Preference center defaults: `card_width: "100%"`, `card_padding: "0px"`; `position` is unused.
- Notification toast after submit: `notification_enabled`, `notification_success_text`,
  `notification_error_text`, `notification_bg_color` (`#10b981`), `notification_error_bg_color`
  (`#ef4444`), `notification_text_color`, `notification_position` (`top` | `bottom`),
  `notification_duration` (ms), `notification_font_size`, `notification_font_weight`,
  `notification_border_radius`, `notification_shadow` (`none` `sm` `md` `lg`),
  `notification_animation` (`fade` `slide` `bounce`) + `notification_animation_direction`,
  `notification_custom_css`. Preference centers show it on the last page's submit.
- Translations: `style_config.i18n[locale]` may override `preference_center_header_html`,
  `preference_center_footer_html`, the `seo_*` strings and the built-in button labels.

### Header and footer HTML must fit every screen

Written chrome is reviewed at 1280, 820 and 390px like everything else (`preview_project` with
`review: true` measures the header and footer: sideways overflow, a header that stacks its links on
the phone). The design usually shows the desktop bar only; the phone menu is still yours to write.
Rules, all of them HARD:

- Fluid, never fixed: containers take `max-width` + `width: 100%`, never `width: 1200px`; images
  take a fixed `height` with `width: auto; max-width: 100%`; `box-sizing: border-box` on everything.
- Two breakpoints: `@media (max-width: 820px)` (tablet: wrap, shrink padding) and
  `@media (max-width: 480px)` (phone). Links at 16px or more, tap targets 44px tall.
- A menu toggle on the phone: a `<button type="button" aria-expanded="false">` that toggles an
  `is-open` class from `_js` (inline `onclick` is stripped by the sanitizer). The open menu is a
  full-width panel under the bar that pushes the page down — never a column beside the logo, never
  a fixed overlay that hides the bar.
- Prefix your classes (`jl-nav__…`): the CSS is not scoped. Colors are hex values from the workspace
  branding (`brand:` references do not resolve inside raw CSS).
- The `_js` runs once after the HTML is in the DOM, with `document` scoped to the widget: query
  through `document`, never `window.document`. The editor canvas and every preview skip it, so the
  closed bar has to look right with no script at all — hide the menu with CSS and let the script
  only toggle a class. The rendered review therefore measures the closed bar; the open panel is
  yours to check on the published page.
- Copy the template below and change words, colors and links. Validate warns when header or footer
  CSS has no breakpoint, the header has no toggle, or a width above 390px is fixed.

`preference_center_header_html`:

```html
<header class="jl-nav">
  <a class="jl-nav__brand" href="/"
    ><img src="LOGO_URL" alt="Brand" height="32"
  /></a>
  <button
    class="jl-nav__toggle"
    type="button"
    aria-expanded="false"
    aria-controls="jl-nav-menu"
    aria-label="Menu"
  >
    <span></span><span></span><span></span>
  </button>
  <nav id="jl-nav-menu" class="jl-nav__menu">
    <a href="#features">Features</a>
    <a href="#pricing">Pricing</a>
    <a href="#faq">FAQ</a>
    <a class="jl-nav__cta" href="#signup">Get started</a>
  </nav>
</header>
```

`preference_center_header_css`:

```css
.jl-nav,
.jl-nav * {
  box-sizing: border-box;
}
.jl-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  font-family: inherit;
  color: #111827;
  background: #fff;
}
.jl-nav__brand img {
  display: block;
  height: 32px;
  width: auto;
  max-width: 160px;
}
.jl-nav__menu {
  display: flex;
  align-items: center;
  gap: 24px;
}
.jl-nav__menu a {
  color: inherit;
  text-decoration: none;
  font-size: 16px;
  line-height: 44px;
  white-space: nowrap;
}
.jl-nav__cta {
  padding: 0 20px;
  border: 1px solid currentColor;
  border-radius: 8px;
}
.jl-nav__toggle {
  display: none;
  width: 44px;
  height: 44px;
  padding: 11px 10px;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
}
.jl-nav__toggle span {
  display: block;
  height: 2px;
  background: currentColor;
}
@media (max-width: 820px) {
  .jl-nav {
    flex-wrap: wrap;
    padding: 12px 16px;
  }
  .jl-nav__toggle {
    display: flex;
    margin-left: auto;
  }
  .jl-nav__menu {
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    width: 100%;
    padding: 8px 0 16px;
  }
  .jl-nav__menu a {
    line-height: 48px;
    white-space: normal;
  }
  .jl-nav__cta {
    margin-top: 8px;
    text-align: center;
  }
  .jl-nav.is-open .jl-nav__menu {
    display: flex;
  }
}
```

`preference_center_header_js`:

```js
(function () {
  var n = document.querySelector('.jl-nav'),
    b = n && n.querySelector('.jl-nav__toggle');
  if (!b) return;
  function set(o) {
    n.classList.toggle('is-open', o);
    b.setAttribute('aria-expanded', String(o));
  }
  b.addEventListener('click', function () {
    set(!n.classList.contains('is-open'));
  });
  n.querySelectorAll('.jl-nav__menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      set(false);
    });
  });
})();
```

`preference_center_footer_html`:

```html
<footer class="jl-foot">
  <div class="jl-foot__grid">
    <div class="jl-foot__col">
      <img src="LOGO_URL" alt="Brand" height="28" />
      <p>One line about the company.</p>
    </div>
    <nav class="jl-foot__col" aria-label="Company">
      <h4>Company</h4>
      <a href="/about">About</a><a href="/blog">Blog</a
      ><a href="/contact">Contact</a>
    </nav>
    <nav class="jl-foot__col" aria-label="Legal">
      <h4>Legal</h4>
      <a href="PRIVACY_URL">Privacy policy</a><a href="TERMS_URL">Terms</a>
    </nav>
  </div>
  <p class="jl-foot__legal">© 2026 Brand. All rights reserved.</p>
</footer>
```

`preference_center_footer_css`:

```css
.jl-foot,
.jl-foot * {
  box-sizing: border-box;
}
.jl-foot {
  width: 100%;
  padding: 40px 24px 24px;
  font-family: inherit;
  color: #fff;
  background: #111827;
}
.jl-foot__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}
.jl-foot__col img {
  display: block;
  height: 28px;
  width: auto;
  max-width: 140px;
  margin-bottom: 12px;
}
.jl-foot__col h4 {
  margin: 0 0 8px;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
}
.jl-foot__col a {
  display: block;
  color: inherit;
  text-decoration: none;
  font-size: 16px;
  line-height: 40px;
}
.jl-foot__col p {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  opacity: 0.8;
}
.jl-foot__legal {
  max-width: 1200px;
  margin: 32px auto 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 14px;
  opacity: 0.7;
}
@media (max-width: 480px) {
  .jl-foot {
    padding: 32px 16px 16px;
  }
  .jl-foot__grid {
    gap: 24px;
  }
}
```

The footer needs no JS. The same rules hold for the `css` of an `html-block` item: fluid widths,
images at `max-width: 100%`, a `@media` rule for anything laid out in columns.

## SEO (`seo_*`)

For hosted pages (preference centers and landing pages): `seo_page_title` (`<title>`),
`seo_meta_description`, `seo_favicon_url`, `seo_og_image_url`. Ignored by embedded popups.

## Style classes (`element_presets`)

Reusable element styles the editor offers as **classes** (Branding → Style classes, and the class
picker on an element). They live in the workspace branding: `jule://workspaces/{id}/branding` →
`element_presets[]`, each `{ id, name, position, target, style, project_id? }`. `target` is the
item type the class is for — `button`, `text`, `input` or `flex` (a Box); `style` holds class-able
keys (below) with the values `style_info` takes, `brand:<name>` colors included; a class with
`project_id` belongs to that one project (the editor's "this project only" classes), one without
is shared by the whole workspace. Read them before styling: "our button style", "the heading
class", "the brand input look" name a class, and a class that fits the element you are placing
wins over hand-rolled values.

**Apply a class to an item** — two steps, both required:

1. `config.presetIds: ["<class id>"]` (several in order; a later class wins on a shared key). Only
   classes whose `target` matches the item type apply: `text` → text, `button` → button, `input` →
   input (checkbox inputs carry no class), `flex` → Box. Skip a project-scoped class of another
   project.
2. Copy the class `style` values into the item's `style_info`: the widget reads `style_info` only,
   and the editor re-applies the class when it opens the project, so the two must agree.

The editor treats every class-able key as owned by the class: when it reconciles it writes the
class values and **clears the other class-able keys** the item set itself. Keep a deliberate
per-item deviation by naming that key in `config.presetOverrides: ["textAlign"]` — the class never
writes it and it stays local. Keys outside the class-able set (`display`, `objectFit`, `customCss`,
`boxShadow`, `opacity`, `responsive`, `i18n`, …) are always the item's own.

Class-able keys — typography `fontFamily`, `fontUrl`, `fontSize`, `fontWeight`, `letterSpacing`,
`lineHeight`, `color`, `textAlign` (text, button, input); box `width`, `height`, `maxWidth`,
`alignSelf`, `borderWidth`, `borderRadius`, `borderColor`, `borderStyle`, `backgroundColor`,
`backgroundImage`, `backgroundSize`, `backgroundPosition`, `padding`, `margin` and the stack / grid
child keys `pin`, `pinOffsetX`, `pinOffsetY`, `stackOrder`, `gridArea`, `gridSpanColumns`,
`gridSpanRows` (every target); option cards `activeBackground`, `activeColor`, `activeBorderColor`,
`optionGap`, `markerSize` (input); Box layout `gridTemplateColumns`, `gridTemplateRows`,
`gridTemplateAreas`, `flexDirection`, `alignItems`, `justifyContent`, `flexWrap`, `gap`, `rowGap`,
`columnGap` (flex).

**Worked example.** `jule://docs/examples/landing-page-classes` is a marketing page whose cards,
headings, copy and buttons are bound to twelve classes (`cls-card`, `cls-card-title`,
`cls-card-text`, `cls-section-name`, `cls-heading`, `cls-secondary-text`, `cls-stat`, `cls-eyebrow`,
`cls-on-dark-title`, `cls-on-dark-text`, `cls-step-card`, `cls-cta-btn`); every bound item carries
the class values in `style_info` and names its own deviations in `presetOverrides` (a centred
paragraph, a transparent second button). The first four classes, as `update_branding` takes them:

```json
[
  {
    "id": "cls-eyebrow",
    "name": "eyebrow",
    "position": 0,
    "target": "text",
    "style": {
      "fontSize": "14px",
      "fontWeight": "600",
      "letterSpacing": "2px",
      "color": "brand:Teal"
    }
  },
  {
    "id": "cls-section-name",
    "name": "section-name",
    "position": 1,
    "target": "text",
    "style": {
      "fontSize": "18px",
      "fontWeight": "400",
      "color": "brand:Teal",
      "textAlign": "center"
    }
  },
  {
    "id": "cls-heading",
    "name": "heading",
    "position": 2,
    "target": "text",
    "style": {
      "fontSize": "34px",
      "fontWeight": "400",
      "color": "#111827",
      "textAlign": "center",
      "lineHeight": "1.2"
    }
  },
  {
    "id": "cls-secondary-text",
    "name": "secondary-text",
    "position": 3,
    "target": "text",
    "style": {
      "fontSize": "16px",
      "fontWeight": "400",
      "color": "brand:Muted Gray",
      "lineHeight": "1.5"
    }
  }
]
```

**Workflow for a new page with its own classes.** 1) `create_project`; 2) read
`jule://workspaces/{id}/branding`, append the new classes with `project_id` set to the new project
id (or without it for classes the whole workspace should share) and send the complete list to
`update_branding` → `element_presets`; 3) save the document with `config.presetIds` on the bound
items and the class values copied into their `style_info`. Reuse an existing workspace class
before inventing one: "our button style" is a class the user already made.

**Create or change classes** with `update_branding` → `element_presets`: the list replaces the
stored one, so read the resource first, keep existing ids (items reference them), add or edit, and
send everything back; at most 40 classes per scope (the workspace, or one project). A changed class
reaches the items bound to it when the project is next opened in the editor; documents you save
carry the `style_info` you wrote, so re-save the ones that follow a class you changed. Published
projects keep their resolved styles until republished.

## Defaults a new project gets

The editor freezes these into `style_config` on creation: `template: "default"`,
`position: "center"`, `border_radius: "12px"`, `card_width: "400px"` (`"100%"` for a preference
center), `card_height: "auto"`, `card_padding: "20px"` (`"0px"`), `justify_content: "center"`,
`card_border_width: "0px"`, `card_border_color: "#e5e7eb"`, `card_border_style: "solid"`,
`primary_color: "#7c3aed"` (or the workspace primary), `button_text_color: "#ffffff"`,
`button_padding: "10px"`, `button_font_size: "14px"`, `button_radius: "6px"`,
`input_text_color: "#1f2937"`, `input_padding: "10px"`, `input_font_size: "16px"`,
`input_radius: "6px"`, `desc_color: "#111827"`, `desc_font_size: "16px"`,
`title_font_size: "30px"`, `background_type: "color"`, `background_color: "#ffffff"`,
`background_object_fit: "cover"`, close button 16px / `#111827` / transparent / 0 / 0,
`overlay_opacity: 0`, `overlay_blur: 0`, `notification_bg_color: "#10b981"`,
`notification_error_bg_color: "#ef4444"`. Send the same set when you create a document from
scratch so the result matches what the editor would have produced.

## Legacy top-level fields

`display_type` (`modal`), `primary_color`, `thank_you_message`, `redirect_url` on the project
itself predate `style_config` / `success_message`; prefer `style_config.primary_color`, a
`success_message` item and `sign_up_config.success_behavior`.
