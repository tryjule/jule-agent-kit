# Jule Item Catalog

Every page of a Jule project is a flat list of **items**. An item is
`{ id?, type, config, style_info, parent_id, side?, visibility?, error_style_info? }`;
`type` decides the `config` shape; on `text`, `button`, `input` and `flex` items `config` may also carry
`presetIds` / `presetOverrides`, the binding to a workspace style class (Style classes in
`jule://docs/project-style`). This guide explains what each of the 13 types does in the
published widget (`widget.js`), what the editor calls it, which fields matter, one real-shaped
JSON example, and what it needs to work. Field-level detail for every key lives in the schema,
served in parts: `jule://docs/schema/items/<type>` for one item type (or `whoami` with
`doc: "document-schema"` and `section: "items/<type>"`); the schema is the contract, this guide is
the behaviour, and every validation error already quotes the field's description and allowed values.

Editor names differ from `type` values. Element palette → `type`: Headline / Paragraph → `text`,
Email / Phone / Address / Date / Time / Input / Text Area / Dropdown / Checkbox / Single Select →
`input` (with `inputType`), Rating → `rating`, Image → `logo`, Icon → `icon`, Button → `button`,
HTML Block → `html-block`, Form Message → `success_message`, Container → `flex`, Coupon →
`coupon`, Channels & Types → `group` (with `iterableChannelsGroup`). `checkbox-group` and
`preference-category` are not in the palette any more (see their sections).

**Items first, `html-block` last.** Build every page from these items — `text`, `logo`, `icon`,
`button`, `input`, `rating`, `coupon`, `success_message` inside `flex` Boxes — because only items
are editable element by element in the dashboard, translated per field, colored from the workspace
branding, adapted per device and measured by analytics. An `html-block` is for what the items
cannot show (embedded video, third-party widgets, tables, custom vector art or canvas), never for a
heading, paragraph, image, link, field, button, section or page; `validate_project_document` and
every save warn when a block holds page content or form controls. Blocks the user built in the
editor are theirs and stay as they are.

## How items fit together

- **Nesting.** Only `flex` (Container) and `group` hold children. A child names its parent in
  `parent_id`; top-level items have `parent_id: null`. Siblings render in the order they appear in
  the page's `items` array (the server assigns `order_index` from array position and ignores an
  `order_index` you send). Write items in reading order.
- **Ids on save.** `id` is optional. A UUID you got back from `get_project` updates that item; any
  other string (`"box-1"`) is a placeholder the server replaces with a fresh UUID. `parent_id`,
  `config.linkedPhoneInputId` and `config.targetPageId` are remapped through the same table, so
  placeholders work for nesting within one save. A `parent_id` that matches no item in the
  document becomes `null` (top level). Page ids behave the same way. Keys of
  `settings_config.logic_rules` / `logic_fallback` / `page_iterable_*` are **not** remapped: add
  logic for a new page in a second save after reading its real id.
- **Every save replaces every item** of every page (pages you omit are deleted, `expected_version`
  must equal the version you last read or the save fails with 409).
- **Two-column template.** With `style_config.template: "2-column"` each top-level item carries
  `side: "left" | "right"`; anything without `side: "left"` goes right. Children follow their
  parent. `side` is ignored by the `default` template.
- **Visibility.** `visibility: { hideOnMobile?, hideOnTablet?, hideOnDesktop? }` (≤768px, ≤1024px,
  wider). Children of a hidden parent are hidden with it.
- **Translations.** Text-bearing configs have `i18n: { "<locale>": { "<field>": "…" } }`; `style_info.i18n`
  holds per-locale style overrides. Locales come from `settings_config.localeConfig`
  (see the settings guide). The base language lives in the plain fields.
- **Placeholders in text.** `{% fieldName %}` in `text` content is replaced from the answers given
  so far, and `{% __score__ %}` from the running quiz score (the logic rules' points); `{{field}}`
  is replaced from the visitor's Iterable profile (`{{first_name | fallback}}` allowed). Unknown
  or empty placeholders are left as typed.

## Style fields (`style_info`) shared by every type

Values are CSS strings (`"16px"`, `"1rem 2rem"`, `"#111827"`). Any color may instead be a **brand
reference** `brand:<name>` where `<name>` is a color name from the workspace branding
(`jule://workspaces/{id}/branding`, `brand_color_groups[].colors[].name`, case-insensitive); the
widget resolves it at render time and an unknown name is used verbatim. Brand colors may be CSS
gradients; the widget paints gradients as background layers and clips text gradients to glyphs.

| Group                           | Fields                                                                                                                                                                                                                                                      | Notes from the renderer                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typography                      | `fontSize`, `fontWeight`, `fontFamily` + `fontUrl`, `color`, `textAlign`, `lineHeight`, `letterSpacing`                                                                                                                                                     | `fontUrl` is any font stylesheet or file URL: a workspace font from branding `fonts[]`, or a Google Fonts CSS2 URL (`https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap`). Prefer the workspace font when the brand has one. Set both keys or neither.                                                                                                                                                                                                                                                                                    |
| Box                             | `padding`, `margin`, `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `backgroundColor`, `backgroundImage`, `backgroundSize`, `backgroundPosition`, `borderWidth`, `borderColor`, `borderStyle`, `borderRadius`, `boxShadow`, `opacity` | `width` on a `text` item becomes `max-width`. A `%`/`vw` width on a non-text item is applied to the item's wrapper. A `height` other than `auto` adds `overflow: auto` (except buttons and Stack Boxes). `borderWidth` without `borderColor` draws a transparent border. `backgroundImage` without `backgroundSize` means `cover`; `backgroundSize: "auto"` tiles. |
| Child alignment                 | `alignSelf` (`flex-start`/`center`/`flex-end`/`stretch`), `justifySelf`                                                                                                                                                                                     | `alignSelf` makes the wrapper a full-width flex row that positions the item; fill-by-default items (buttons, most inputs, coupon, category, message) then take `width: 100%` unless `width` is set.                                                                                                                                                                |
| Box parent (Container)          | `display` (`flex` default, `stack`, `grid`), `flexDirection`, `alignItems`, `justifyContent`, `flexWrap`, `gap`, `rowGap`, `columnGap`, `gridTemplateColumns`, `gridTemplateRows`, `gridTemplateAreas`, `clipContents`                                      | Only read on `type: "flex"`.                                                                                                                                                                                                                                                                                                                                       |
| Box child                       | `pin`, `pinOffsetX`, `pinOffsetY`, `stackOrder` (inside a Stack), `gridArea`, `gridSpanColumns`, `gridSpanRows` (inside a Grid)                                                                                                                             | Ignored when the parent's mode cannot use them.                                                                                                                                                                                                                                                                                                                    |
| Options (radio / single-select) | `activeBackground`, `activeColor`, `activeBorderColor`, `optionGap`, `markerSize`                                                                                                                                                                           | Selected-card colors default to the project primary color.                                                                                                                                                                                                                                                                                                         |
| Checkbox                        | `checkColor`, `checkboxVariant` (`box`/`switch`), `checkboxPosition` (`left`/`right`), `gap`                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                    |
| Other                           | `objectFit` (logo), `contentAlign` (coupon), `customCss` (raw declarations appended), `suggestionStyle` (email typo line), `responsive.tablet` / `responsive.mobile` (partial overrides), `i18n`                                                            | `responsive.mobile` applies on top of `tablet`.                                                                                                                                                                                                                                                                                                                    |

Every item type also honours `error_style_info` only when it is a `success_message`.

---

## `text`

**Purpose.** A heading, paragraph, inline span or link. Editor: Headline (`tag: "h1"`) and
Paragraph (`tag: "p"`); the properties panel calls it Text.

**Config.** `content` (HTML string, see Rich text below; placeholders as above), `tag` (`h1|h2|h3|p|span|a`;
anything else renders as `p`; `span` and `a` render inline and lose `width`/`display`), `href` +
`target` (only for `tag: "a"`; `_blank` adds `rel="noopener noreferrer"`), `startIcon` / `endIcon`
(an `ItemIcon` from the icon library) + `iconGap` (px, default 8), `isSmsDisclaimer` +
`linkedPhoneInputId` (marks the SMS consent text that belongs to a `tel` input; inside a Grid Box
the two render in one grid cell), `errorContent` (only meaningful on `success_message`), `i18n`
(`content`, `errorContent`).

**Rich text.** `content` is the HTML the editor's text toolbar writes, and the same marks are yours
to write: one `<p>…</p>` per paragraph (`<br>` for a soft break inside one), **Bold** →
`<strong>`, *Italic* → `<em>`, Underline → `<u>`, Add Link → `<a href="https://…">` inside the
copy (`target="_blank"` when it should open a new tab; the whole item becomes a link with
`tag: "a"` + `href` instead), Text Color → `<span style="color: #hex">` around the words that
change color (a gradient run is `<span style="background-image: linear-gradient(…);
-webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent">`), and
the two insert buttons → `{{fieldName}}` for an answer and an Iterable profile field name in the
same braces. Lists (`<ul>`, `<ol>`, `<li>`) and `<code>` / `<pre>` survive too. Rules: colors inside
`content` are hex or any CSS color, never `brand:` references (those resolve only in `style_info`
and `style_config`), so copy the hex from `jule://workspaces/{id}/branding`; font size, family,
weight of the whole item and its alignment live in `style_info` (`fontSize`, `fontFamily`,
`fontWeight`, `textAlign`) — a `text-align` written inside `content` is removed and inline
`font-size` fights the responsive overrides; the widget sanitizes everything else away (images,
iframes, scripts, event handlers, `data-*`), turns `&nbsp;` into a space and, for `span` / `a` tags,
collapses line breaks. Emphasis is one `<strong>` phrase or one colored word inside the sentence,
never a second text item glued on for it.

**Style.** Typography and box fields. `width` is applied as `max-width`. Default sizes come from
the project style (`title_font_size` 30px/700 for h1, `desc_font_size` 16px for p) when the item
sets none.

```json
{
  "type": "text",
  "parent_id": null,
  "config": {
    "tag": "h1",
    "content": "<p>Get <strong>10% off</strong> your <span style=\"color: #1b7a82\">first order</span></p>",
    "i18n": {
      "de": { "content": "<p><strong>10 % Rabatt</strong> auf die <span style=\"color: #1b7a82\">erste Bestellung</span></p>" }
    }
  },
  "style_info": {
    "fontSize": "30px",
    "fontWeight": "700",
    "color": "brand:Ink",
    "textAlign": "left",
    "margin": "0px"
  }
}
```

**Constraints.** One `h1` per page reads best (heading order matters for screen readers). A
disclaimer text needs `isSmsDisclaimer: true` and `linkedPhoneInputId` set to the phone input's
id (placeholder ids are remapped on save). Its `content` is **not yours to write**: whenever the
project is read or served, Jule replaces it with the workspace's SMS disclaimer (branding
`legal.sms_disclaimer`, or Jule's standard consent text when none is set), and the editor shows
it locked — send the branding text or any placeholder and only style the item.

## `button`

**Purpose.** A navigation or submit control. Editor: Button. In a preference center the palette
sets `action: "submit"`.

**Config.** `label` (required; empty renders "Button"), `action` (required; default when missing
is `next`). The editor offers six, named as in its dropdown: `next` **Next Page** (or jump to
`targetPageId` when set), `previous` **Previous Page**, `submit` — shown as **Submit & Next Page**
on any page but the last (records the answers, then advances), **Submit & Close** on the last page
(records the answers and closes) and plain **Submit** in a preference center (saves the
preferences), `submit_and_redirect` **Submit & Redirect** (+ `redirectUrl`, http(s) only), `close`
**Close** (closes without submitting), `redirect` **Redirect to URL** (+ `redirectUrl`; leaves
without submitting). A preference center offers only `submit` and `submit_and_redirect`.
`submit_and_next`, `submit_and_page` (+ `targetPageId`) and `skip` are **legacy**: the widget still
runs them for existing items and the editor labels them "(legacy)", but never write them — `submit`
already advances when a page follows, a logic rule routes a submit to a specific page, and a page
nobody needs is deleted rather than skipped; validate warns on each. `startIcon` / `endIcon` +
`iconGap`. `i18n` (`label`).

**Behaviour.** A page logic rule that matches wins over the button's own destination; the button's
terminal action (redirect, target page, close) wins over the page's `logic_fallback`. `close` and
`redirect` skip required-field validation (the visitor is leaving); every other action validates the
current page first and runs the email deliverability check. A Submit button whose page has a rule
routing to a terminal page still submits, then lands on that page. A page with no forward action
(`next`, `skip`, `submit*`) and no `submitOnSelect` input is a **terminal page**: reaching it after a
submit completes the widget.

**Style.** Inherits `button_*` project defaults (padding 10px, font 14px/500, radius 6px, primary
background, white text). `alignSelf` positions it; `width` fixes it.

```json
{
  "type": "button",
  "parent_id": null,
  "config": { "label": "Subscribe", "action": "submit" },
  "style_info": {
    "backgroundColor": "brand:Primary",
    "color": "#ffffff",
    "padding": "10px",
    "fontSize": "14px",
    "fontWeight": "500",
    "borderRadius": "6px",
    "borderWidth": "1px",
    "borderColor": "brand:Primary",
    "borderStyle": "solid"
  }
}
```

**Constraints.** `redirectUrl` is required for the redirect actions, `targetPageId` for
`submit_and_page`. Navigation is these `button` items and nothing else: **every page except the
last needs its own forward button**. Real projects use `next` between pages, one `submit` (or
`submit_and_redirect`) on the page where the form ends, and `close` / `redirect` on a thank-you
page. The widget accepts one submit per visit, so a `submit` on a page followed by pages that
collect answers loses those answers — put it on the last page that asks anything and let only a
thank-you page follow. Never
set `style_config.hide_next` / `hide_previous`: they hide every `next` / `previous` button in the
document (there is no separate built-in bar). `validate_project_document` warns about a page with
no way forward and about `hide_next`.

## `input`

**Purpose.** A form field. Editor: Email, Phone, Address, Date, Time, Input, Text Area, Dropdown,
Checkbox, Single Select (all `type: "input"` with a different `inputType`).

**Config.** `fieldName` (**required**, the key of the answer in the submission and in Iterable
mappings; unique per project; names starting with `__` are reserved), `inputType`:

| `inputType`                                                         | Renders                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`, `textarea`, `number`                                        | native control                     | `validation: { minLength, maxLength, pattern, min, max }`; `number` is checked as a number.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `email`                                                             | native email                       | Format validated; `emailTypoCheck` suggests fixes for common domains (`suggestionStyle` styles the line); the server-side deliverability check can block a domain with no mail server (settings guide).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tel`                                                               | intl-tel-input with country picker | Value must be a valid E.164 number or the page will not advance. Pair it with an SMS disclaimer `text` item (workspace `legal.sms_disclaimer`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `url`                                                               | legacy alias of `text`             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `date`, `time`                                                      | native pickers                     | Submitted as ISO `YYYY-MM-DD`; `includeTime` gives `YYYY-MM-DDTHH:mm`. `dateFormat` (`auto` = visitor locale, or a preset such as `DD.MM.YYYY`, `MMMM D, YYYY`) and `timeFormat` (`auto`, `hh:mm`, `hh:mm:ss`, `hh:mm:ss.s`, `hh:mm TZD`, `hh:mm:ss TZD`) only change what the visitor sees; `custom` reads the pattern from `dateFormatCustom` (tokens `yy`/`yyyy`, `m`/`mm`/`mmm`/`mmmm`, `d`/`dd`/`ddd`/`dddd` joined by `/`, `.`, `-`, `,` or space — `"dd.mm.yyyy"`, `"dddd, d mmmm yyyy"`) or `timeFormatCustom` (tokens `hh`, `mm`, `ss`, `s`, `TZD`; 24-hour — `"hh.mm"`). The widget paints a custom format in an overlay over the native field, so keep the pattern short. `timeZone` (`visitor` default, `UTC`, IANA name) and `timeValueFormat` (`wall`, `offset`, `utc`, `wall_zone`) decide what is submitted; Iterable reads only `offset` and `utc` as dates. |
| `radio`, `single-select`, `dropdown` (`select` = legacy `dropdown`) | option cards or a select           | `options: [{ value, label }]`; without options the widget shows "Option 1/2/3". `renderAs` (`button`, `radio`, `tick`, `ab`) picks the card marker; `hoverEffect` (default on). `submitOnSelect` advances (or submits on the last page) as soon as a choice is tapped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `multiselect`                                                       | cards, several selectable          | Same `options`; submits an array.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `checkbox`                                                          | one consent box                    | The label is `placeholder` (default "Select this option"). `iterableListIds`, `iterableUnsubscribedChannelIds`, `iterableSubscribedMessageTypeIds`, `iterableUnsubscribedMessageTypeIds` apply when checked. Inside a channels group the `_isChannelToggle` / `_iterableChannelId` / `_iterableMessageTypeId` / `checkboxBehavior` fields are managed (see `group`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Shared: `placeholder`, `required`, `defaultValue` (never overwrites what the visitor typed),
`urlPrefillParam` (a query parameter allowed to override `defaultValue`; values are capped at 512
chars and dates must be real ISO dates), `startIcon` / `endIcon` + `iconGap` (text-like inputs
only), `i18n` (`placeholder`, `options` labels by value).

**Style.** Inherits `input_*` project defaults (padding 10px, 16px, radius 6px, `#1f2937` text,
1px `#d1d5db` border). Text-like inputs, dropdown, radio, single-select and multiselect fill their
row by default. Checkbox styles: `checkColor`, `checkboxVariant`, `checkboxPosition`, `gap`.

```json
{
  "type": "input",
  "parent_id": null,
  "config": {
    "fieldName": "email",
    "inputType": "email",
    "placeholder": "name@example.com",
    "required": true,
    "emailTypoCheck": true
  },
  "style_info": {
    "padding": "10px",
    "fontSize": "16px",
    "borderRadius": "6px",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "backgroundColor": "#ffffff"
  }
}
```

```json
{
  "type": "input",
  "parent_id": null,
  "config": {
    "fieldName": "plan",
    "inputType": "single-select",
    "renderAs": "tick",
    "submitOnSelect": false,
    "options": [
      { "value": "starter", "label": "Starter" },
      { "value": "pro", "label": "Pro" }
    ]
  },
  "style_info": {
    "activeBackground": "brand:Primary",
    "activeColor": "#ffffff",
    "optionGap": "8px"
  }
}
```

**Constraints.** `fieldName` is required and must be unique. Required fields block `next`/`submit`
until filled and valid. Logic rules read answers by `fieldName`.

## `logo`

**Purpose.** An image, usually the brand logo. Editor: Image (or Logo when it points at a
branding logo).

**Config.** `imageUrl` (a full https URL, or the stored key `list_assets` returns as `url` — the
widget resolves keys for this item type only) **or** `logo: { id, name, url }` taken from the
workspace branding `logos[]`; `altText`; `isWorkspaceLogo` (editor flag: the item is the brand
Logo and uploads go to branding; the widget itself renders whichever URL is in `imageUrl` /
`logo.url`, so pick the branding logo you want by copying its entry).

**Style.** `width` (default 200px), `height`, `objectFit` (default `contain`), `borderRadius`,
`alignSelf` / `textAlign` for placement.

```json
{
  "type": "logo",
  "parent_id": null,
  "config": {
    "logo": { "id": "l1", "name": "acme.png", "url": "logos/acme.png" },
    "isWorkspaceLogo": true,
    "altText": "Acme"
  },
  "style_info": { "width": "160px", "margin": "0 auto 16px" }
}
```

**Constraints.** Renders nothing without a URL. Pictures come from `list_assets`, a branding
logo, or `upload_branding_asset` (kind `image` or `logo`). Always set `altText` (empty falls back
to the file name).

## `group`

**Purpose.** A container whose children render in place; the widget draws no title, border or
collapse control for it (`title` and `collapsed` are editor-only). In practice a `group` is the
**Iterable channels element** (editor: Channels & Types) and its generated sub-groups.

**Config.** `title`, `htmlId` (anchor target for `#id` links), `collapsed`, `i18n` (`title`), and
the Iterable fields: `iterableChannelsGroup: true` on the top-level element with
`channelConfig: { selectedChannels: [{ id, name }], selectedMessageTypes: [{ id, name, channelId }],
helperCheckbox: "none" | "subscribe_all" | "unsubscribe_all" | "both", channelStyleInfo?,
messageTypeStyleInfo? }` (the two style infos: Channel / Type styles below); `iterableChannelId` on
one child group per channel; `iterableHelperGroup: true` on the group holding the helper checkboxes.

**Generated structure the editor produces** (build the same shape by hand):

```
group  { iterableChannelsGroup: true, channelConfig: {…} }
├── group { iterableChannelId: 131795 }
│   ├── input { inputType: "checkbox", fieldName: "marketing_channel", placeholder: "Marketing Channel",
│   │           _isChannelToggle: true, _iterableChannelId: 131795, checkboxBehavior: "default" }
│   └── input { inputType: "checkbox", fieldName: "marketing_message", placeholder: "Marketing Message",
│               _iterableMessageTypeId: 170399, checkboxBehavior: "default" }
└── group { iterableHelperGroup: true }
    ├── input { inputType: "checkbox", placeholder: "Subscribe to all", checkboxBehavior: "select_all" }
    └── input { inputType: "checkbox", placeholder: "Unsubscribe from all", checkboxBehavior: "unselect_all" }
```

Ids and names must match the live Iterable data in `jule://workspaces/{id}/integrations`
(`channels[]`, `message_types[]`).

**Channel / Type styles** (editor: Style → Channel / Type Styles, tabs All · Channels · Types). The
generated toggles are ordinary `checkbox` inputs and the widget reads each one's own `style_info`,
nothing else. The editor keeps the panel's values in `channelConfig.channelStyleInfo` (Channels
tab) and `channelConfig.messageTypeStyleInfo` (Types tab) and copies them onto every generated
toggle whenever it reconciles the group; the All tab writes the group's own `style_info` and both
scoped infos. So write the same keys in both places: the scoped infos so the editor keeps them,
and each toggle's `style_info` so the widget draws them. The panel's fields and the keys behind
them: Style → `checkboxVariant` (`box` default | `switch`); Position → `checkboxPosition` (`left`
default | `right`); Size → `width` **and** `height` (default `16px`); Border Width → `borderWidth`
(`1px`); Border Radius → `borderRadius` (`4px`); Accent Color → `borderColor` (the box border and
the checked fill; one solid color, default the project primary); Check Color → `checkColor`
(`#ffffff`); Label Text: Font Size → `fontSize` (`16px`), Weight → `fontWeight` (channels `700`,
message types `400`), Text Color → `color` (`#1f2937`), Font Family → `fontFamily` + `fontUrl`;
Layout: Align → `alignSelf`, Padding → `padding`, Margin → `margin` (channels `10px 0 0 0`,
message types `0 0 0 14px`). Style classes (`config.presetIds`) bind to the toggles like to any
input.

```json
{
  "id": "channels",
  "type": "group",
  "parent_id": null,
  "config": {
    "title": "Email preferences",
    "iterableChannelsGroup": true,
    "channelConfig": {
      "helperCheckbox": "both",
      "selectedChannels": [{ "id": 131795, "name": "Marketing Channel" }],
      "selectedMessageTypes": [
        { "id": 170399, "name": "Marketing Message", "channelId": 131795 }
      ],
      "channelStyleInfo": {
        "checkboxVariant": "switch",
        "borderColor": "brand:Primary",
        "fontWeight": "700",
        "margin": "10px 0 0 0"
      },
      "messageTypeStyleInfo": {
        "width": "16px",
        "height": "16px",
        "borderRadius": "4px",
        "color": "#4b5563",
        "margin": "0 0 0 14px"
      }
    }
  },
  "style_info": {}
}
```

**Constraints.** Requires an **active Iterable connection** in the workspace (the editor shows "No
channels found. Make sure Iterable is connected."). Loading and writing the visitor's
subscriptions also needs `settings_config.iterable_integration.preference_center_enabled: true`
with the same `channels` / `message_types` mirrored there. A project containing an
`iterableChannelsGroup` is listed by Jule as a **preference center**; a `preference_center`
project without one is listed as a **landing page**.

## `checkbox-group`

**Purpose.** A labelled list of plain checkboxes. **Not offered by the editor palette any more**
(legacy items still render). Prefer one `checkbox` input per consent, or a channels `group`.

**Config.** `label`, `options: [{ id, label, value, checked? }]`, `i18n` (`label`, option labels by
id). Answers are keyed by the **item id**, not a `fieldName`, so logic rules and Iterable mappings
cannot read them by name.

```json
{
  "type": "checkbox-group",
  "parent_id": null,
  "config": {
    "label": "Topics",
    "options": [
      { "id": "o1", "label": "Product news", "value": "news" },
      { "id": "o2", "label": "Events", "value": "events", "checked": true }
    ]
  },
  "style_info": {}
}
```

**Constraints.** Renders with fixed inner spacing; only the outer box and typography styles apply.
No Iterable dependency, no validation.

## `preference-category`

**Purpose.** A heading plus optional description used to title a section of a preference center.
Editor: Category. **Not offered by the current palette**; use a `text` heading instead for new
work.

**Config.** `title` (default "Category"), `description`, `i18n`.

**Behaviour.** Renders a bold `h3` and a smaller muted paragraph, fills its row by default. It has
**no Iterable dependency** in the widget — it is static text (contrary to older notes that said it
required an Iterable connection).

```json
{
  "type": "preference-category",
  "parent_id": null,
  "config": {
    "title": "Newsletters",
    "description": "Choose what lands in your inbox."
  },
  "style_info": { "fontSize": "18px", "margin": "16px 0 8px" }
}
```

## `html-block`

**Purpose.** Custom HTML with optional CSS and JavaScript for what the other items cannot show:
embedded video, a third-party widget, a table, custom vector art or a canvas. Editor: HTML Block.

**Config.** `name` (editor label), `html`, `css` (scoped to the block: selectors are prefixed with
the block's id, `<style>` tags inside `html` are extracted and scoped too), `javascript` (runs as
an IIFE after the block renders; `<script>` tags inside `html` are executed the same way), `i18n`
(`html`).

**Style.** Outer box styles only (`margin`, `padding`, `backgroundColor`, `width`, …). The block
fits every screen: fluid widths (`max-width` + `width: 100%`, never a fixed width above 390px),
images at `max-width: 100%`, a `@media` rule for anything laid out in columns — the rendered
review measures the card's sideways scroll at 390px and validate warns on a fixed width.

```json
{
  "type": "html-block",
  "parent_id": null,
  "config": {
    "name": "Trust badges",
    "html": "<ul class=\"badges\"><li>Free shipping</li><li>30-day returns</li></ul>",
    "css": ".badges { display:flex; gap:12px; list-style:none; padding:0 }"
  },
  "style_info": { "margin": "12px 0" }
}
```

**Constraints.** The last resort, one block per thing the other 12 types cannot express — never a
heading, paragraph, image, link, field, button, section or a whole page. Inside a block nothing is
editable element by element, translated per field (`i18n.html` is the whole block), colored from
the workspace branding, adapted per device or measured by analytics; **forms inside it are never
submitted by Jule** (visitors' answers go nowhere and reach no integration). Use the item instead:

| Markup you are about to write | Jule item |
|---|---|
| `<h1>`…`<h6>`, `<p>`, `<span>` | `text` (`tag`, `content`) |
| `<img>`, a picture, a logo | `logo` (`imageUrl` / `logo.url`) |
| `<a>` call to action, `<button>` | `button` (`action` redirect / next / submit) |
| `<input>`, `<select>`, `<textarea>`, `<form>` | `input` items + a `button` with a submit action |
| `<section>`, `<div>` layout, columns, overlaps | `flex` Box with `display` flex / grid / stack |
| `<svg>` from the workspace icon library | `icon` |

`validate_project_document` and every save warn when a block holds page content or form controls.
Tell the user which parts fell back to `html-block` and why. Blocks the user built in the editor
are theirs and stay as they are.

## `rating`

**Purpose.** A row of icons the visitor scores with (1…`maxRating`). Editor: Rating.

**Config.** `fieldName` (**required**, default key "rating"), `maxRating` (default 5), `iconType`
(`star` default, `heart`, `thumbs-up`, `smiley`, `crown`, `dog`, `cat`, `circle`, `flag`,
`droplet`, `checkmark`, `lightbulb`, `trophy`, `cloud`, `lightning`, `pencil`, `skull`), `size`
(px, default 32), `strokeColor` / `fillColor` (unselected; defaults `#d1d5db` / transparent),
`selectedStrokeColor` / `selectedFillColor` (defaults `#facc15`; brand refs allowed, gradients are
flattened to a solid), `required`, `submitOnSelect` (advance or submit on tap), `defaultValue`
(`"3"`), `urlPrefillParam`, `valueMap` (`{"1": "Poor", "5": "Great"}` submits the label instead of
the number).

**Style.** Box styles (background, border, padding) apply to the icon row; `alignSelf` places it.

```json
{
  "type": "rating",
  "parent_id": null,
  "config": {
    "fieldName": "nps",
    "maxRating": 5,
    "iconType": "star",
    "required": true,
    "selectedFillColor": "brand:Primary",
    "selectedStrokeColor": "brand:Primary",
    "submitOnSelect": true
  },
  "style_info": {}
}
```

**Constraints.** Logic rules treat the answer as a number (`greater_than` etc. work). Rating with
`submitOnSelect` counts as a forward action (the page is not terminal).

## `success_message`

**Purpose.** Text shown after a submit succeeds; `errorContent` shows when it fails. Editor: Form
Message.

**Config.** Same as `text` (`content`, `errorContent`, `tag`, `i18n`). Both texts are rendered
hidden inside a message area with a placeholder line that keeps the space; after `submit` the
widget reveals one of them, clears the inputs and, for `until_completed` / `once` frequencies,
marks the popup completed.

**Style.** `style_info` styles the success text, `error_style_info` the error text (default
`#047857` / `#dc2626`). `margin` / `alignSelf` / `width` place the area.

```json
{
  "type": "success_message",
  "parent_id": null,
  "config": {
    "tag": "p",
    "content": "<p>Thanks! Check your inbox.</p>",
    "errorContent": "<p>Something went wrong. Please try again.</p>"
  },
  "style_info": { "color": "#047857", "fontSize": "16px" },
  "error_style_info": { "color": "#dc2626", "fontSize": "16px" }
}
```

**Constraints.** Only reveals when the project has `settings_config.sign_up_config` (any popup
made in the editor has one) and the submit happens on the page that holds it; without it the
legacy `sign_up_config.success_behavior` (`message` / `redirect` / `hide`) applies. Put it on the
page with the submit button, or use a second page for a full thank-you screen instead.

## `flex`

**Purpose.** A layout **Box**. Editor: Container. How children take their width and align, and the layouts real pages are built from (inline form row, hero, card grid, bands), are in `jule://docs/layout` — read it before placing items side by side. Children are laid out by `style_info.display`:

| `display`                    | Children                                 | Parent fields                                                                                                                                                                                                   | Child fields                                                                                                                                                                                                |
| ---------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flex` (default when absent) | in a row or column                       | `flexDirection` (default column; `row-reverse` keeps the row sizing rules), `alignItems`, `justifyContent`, `flexWrap`, `gap` / `rowGap` / `columnGap`                                                          | `alignSelf`, `width`                                                                                                                                                                                        |
| `stack`                      | layered in one cell, top-left by default | `clipContents` (clip children that bleed past the edges)                                                                                                                                                        | `pin` (nine anchors), `pinOffsetX` / `pinOffsetY` (CSS lengths, negative bleeds outward), `stackOrder` (0–99 z-order). Pinned children respect the Box padding; offsets are visual and never change layout. |
| `grid`                       | CSS grid                                 | `gridTemplateColumns` (`"1fr 1fr"` is the editor default), `gridTemplateRows`, `gridTemplateAreas` (one row per line, `.` for empty, no quotes), `alignItems`, `justifyContent`, `gap` / `rowGap` / `columnGap` | `gridArea` (wins over spans), `gridSpanColumns`, `gridSpanRows`, `justifySelf`                                                                                                                              |

Responsive overrides (`style_info.responsive.mobile.gridTemplateColumns: "1fr"`) are the usual
way to stack a grid on phones. A `tel` input and its linked SMS disclaimer share one grid cell.

**Config.** `htmlId` — DOM id so header links like `<a href="#pricing">` scroll to the Box (the
widget renders in a shadow root, so native `#id` navigation needs this).

**Style.** All box fields. A Box with `margin` and no `width` gets `width: auto` so right margins
work; an explicit `width` also stops it growing. A Box takes its height from its children unless
`height` is set.

```json
{
  "id": "hero",
  "type": "flex",
  "parent_id": null,
  "config": { "htmlId": "hero" },
  "style_info": {
    "display": "grid",
    "gridTemplateColumns": "1fr 1fr",
    "columnGap": "24px",
    "alignItems": "center",
    "padding": "32px",
    "responsive": { "mobile": { "gridTemplateColumns": "1fr" } }
  }
}
```

```json
{
  "id": "badge-wrap",
  "type": "flex",
  "parent_id": "hero",
  "style_info": { "display": "stack", "clipContents": false, "gridArea": "art" }
}
```

with a pinned child

```json
{
  "type": "text",
  "parent_id": "badge-wrap",
  "config": { "tag": "span", "content": "New" },
  "style_info": {
    "pin": "top-right",
    "pinOffsetX": "-8px",
    "pinOffsetY": "-8px",
    "stackOrder": "2",
    "backgroundColor": "brand:Accent",
    "color": "#fff",
    "padding": "4px 8px",
    "borderRadius": "999px"
  }
}
```

**Constraints.** Use placeholder ids so children can reference the Box in the same save. Do not
put a `group` channels element inside a Box unless the editor would (it works, but the reconcile
pass treats channel items as managed).

## `coupon`

**Purpose.** Assigns the visitor a code from a workspace coupon after the answers are submitted and
reveals it. Editor: Coupon.

**Config.** `coupon_id` (**required** for anything to happen — the widget only treats an item with
`coupon_id` as a coupon), `identifier_type` (`email` default or `phone`: which submitted field
identifies the visitor for the assignment), `display_type` (`always_show`, `label_only` +
`label_template` with `{{code}}`, `spin_wheel` + `wheel_segments` / `wheel_spin_duration` /
`wheel_pointer_color` / `wheel_center_text` / `spin_button_label`, `gift_boxes` + `gift_box_count`
/ `gift_box_colors` / `gift_box_icon` (an emoji such as `"🎁"`) or `gift_box_icon_type: "image"` +
`gift_box_icon_url` (a hosted picture drawn on every box; with `emoji`, the default, the URL is
ignored), `pick_a_ball` + `ball_count` / `ball_colors` / `ball_static`; `prompt_text` sits above
the games), `success_text` (default "Here is your discount code!"), `show_copy_button` (default
on), `show_expiry` + `expiry_display_type` (`label`, `countdown` default, `progress`, `flip`,
`badge`), `show_description` + `description_text`, `shop_now_url` + `shop_now_label` +
`shop_now_append_code` + `shop_now_code_param`, `show_code_in_widget` (off = only tell the visitor
the code was sent), `error_screen` / `expiry_screen` (below), `styles` (below), `i18n`.
`teaser_text` belongs to a retired "before submit" state and is never rendered: omit it.

**Screens.** `error_screen` shows when no code could be assigned, `expiry_screen` when the coupon
has expired. Each is a `CouponScreenConfig`: `goto_page` (0-based page index to jump to instead
of showing the screen — the whole screen is skipped when set), `title`, `message`, `icon_hidden`
(hide the warning / clock icon) and `icon_color`, `bg` (screen background), and one button:
`btn_text`, `btn_bg`, `btn_text_color`, `btn_action` (`close`, the default, closes the widget;
`url` opens `btn_url` in a new tab) and `btn_url`. Titles, messages and button texts are translatable through `i18n` under dotted
keys (`"error_screen.title"`, `"expiry_screen.btn_text"`).

**Styles (`config.styles`, a `CouponStyles`).** Colors are hex (or `brand:` references), sizes
are px numbers. Sections: pre-reveal prompt `prompt_text_color` / `prompt_text_size` (the text
above a wheel, gift boxes or balls); spin button `spin_btn_bg` / `spin_btn_text_color` (the wheel's
button and the gift-box / ball "pick" button); `label_only` text `label_text_color` /
`label_text_size`; success line `success_text_color` / `success_text_size`; code box `code_bg` /
`code_text_color` / `code_text_size` / `code_border_radius` (px) and its `copy_btn_color`;
description `desc_text_color` / `desc_text_size`; countdown and flip timer digits
`timer_digit_bg` / `timer_digit_color`; expiry progress bar `progress_bar_color` /
`progress_track_color`; shop button `shop_btn_bg` / `shop_btn_text_color`. `teaser_bg` is retired
(read only as a fallback for the `label_*` colors) — omit it. A "black spin button with gold timer
digits" is `{ "spin_btn_bg": "#000000", "spin_btn_text_color": "#ffffff", "timer_digit_bg":
"#111111", "timer_digit_color": "#d4af37" }` with `display_type: "spin_wheel"`, `show_expiry: true`
and `expiry_display_type: "countdown"` or `"flip"`.

**Behaviour.** The editor places a coupon on page 2 (it refuses page 1). The widget submits the
form when the visitor reaches the coupon page without a prior submit, assigns a code
(`email`/`phone` from the answers), then renders the reveal; if a submit already happened earlier
the coupon page reveals directly. End the page before the coupon with a `submit` button (the
editor labels it "Submit & Next Page"): the answers are recorded, the widget moves on and the
coupon page reveals at once. A `next` button there works too, but the dashboard's publish check
and `validate_project_document` then report "Form has no submit button" for the form. `error_screen` shows when no code could be assigned (inactive
coupon, limits reached, no codes left). In the editor and non-submitting previews a sample reveal
is shown instead of a live assignment.

**Style.** `contentAlign` (`left`/`center`/`right`, default center) aligns the inner content; the
block fills its row. Section colors live in `config.styles`, sizes are px numbers.

```json
{
  "type": "coupon",
  "parent_id": null,
  "config": {
    "coupon_id": "5f0d4a4e-1c2b-4c6a-9c1e-2a7b8e9d0f11",
    "identifier_type": "email",
    "display_type": "always_show",
    "success_text": "Here is your 10% code",
    "show_copy_button": true,
    "show_expiry": true,
    "expiry_display_type": "countdown",
    "show_description": true,
    "description_text": "Valid for 7 days",
    "shop_now_url": "https://shop.example.com",
    "shop_now_label": "Shop now",
    "shop_now_append_code": true,
    "shop_now_code_param": "discount",
    "styles": {
      "code_bg": "#f5f0ff",
      "code_text_color": "#111827",
      "code_text_size": 24,
      "shop_btn_bg": "brand:Primary",
      "shop_btn_text_color": "#ffffff"
    }
  },
  "style_info": { "contentAlign": "center" }
}
```

**Constraints.** Needs (1) the organization's coupon capability (`coupon_providers.enabled` in
`jule://workspaces/{id}/integrations`; when it is off the widget renders a plain notice instead of
the block), (2) an existing workspace coupon whose id goes in `coupon_id` (coupon tools list them;
there is no coupon creation inside the document), and (3) a page before it that collects the
identifying `email` (or `tel` when `identifier_type: "phone"`).

## `icon`

**Purpose.** A library icon standing on its own (decorative artwork). Editor: Icon.

**Config.** `icon: { ref, svg, viewBox, size?, color? }` copied from the workspace icon library
(`jule://workspaces/{id}/branding` → `icon_groups[].icons[]`: `ref` is `icon:custom/<icon id>`, `svg`
is the inner markup, `viewBox` as stored); `altText` (empty keeps it `aria-hidden`).

**Style.** `width`/`height` or `icon.size` (default 32px when standalone), `color` (paints
`currentColor`; brand refs allowed), box fields, `alignSelf`.

```json
{
  "type": "icon",
  "parent_id": "features",
  "config": {
    "icon": {
      "ref": "icon:custom/1786724194938-gj2ldhaic-10",
      "viewBox": "0 0 24 24",
      "svg": "<g fill=\"currentColor\"><path d=\"M16 6.072a8 8 0 1 1-11.995 7.213…\"/></g>",
      "size": 40,
      "color": "brand:Primary"
    },
    "altText": ""
  },
  "style_info": {}
}
```

**Constraints.** Renders nothing without `icon.svg`. The SVG is a snapshot: re-uploading the library
icon later does not change items already using it. Icons not in the workspace library cannot be
referenced; use an `html-block` with inline SVG for one-offs.
