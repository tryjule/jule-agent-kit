# Jule Languages Guide

A project has one base language and any number of translations. The base strings live in the
plain fields (`config.content`, `config.label`, `style_config.seo_page_title`, …); every other
language lives in an `i18n` map next to them. Nothing is duplicated: a project without
translations renders exactly as before, and a missing translation falls back to the base string
field by field. Languages are enabled in `settings_config.localeConfig`; the dashboard's language
menu (top of the editor) adds and removes them and edits each field per language.

## `localeConfig`

```json
{
  "localeConfig": {
    "defaultLocale": "en",
    "enabledLocales": ["en", "de", "ar"],
    "directions": { "ar": "rtl" }
  }
}
```

- `defaultLocale` — the language of the plain fields (required; `en` when absent).
- `enabledLocales` — every language the widget may show, the default included. Codes are BCP-47
  (`de`, `pt-BR`, `zh-TW`). The editor's list has 31 curated codes: `en`, `es`, `fr`, `de`, `it`,
  `pt`, `pt-BR`, `nl`, `sv`, `no`, `da`, `fi`, `pl`, `cs`, `ro`, `el`, `tr`, `ru`, `uk`, `ja`,
  `ko`, `zh`, `zh-TW`, `th`, `vi`, `id`, `hi`, `ar`, `he`, `fa`, `ur`; any other code works in
  the document but shows without a language name in the editor.
- `directions` — `rtl` per right-to-left language; unlisted codes are `ltr`. The editor sets
  `ar`, `he`, `fa` and `ur` to `rtl` when they are added; a document that enables one of them
  without a `directions` entry renders it left-to-right (`validate_project_document` warns).

## How the visitor's language is chosen

Precedence: an explicit override (`data-jule-locale` on the embed script, `window.JULE_LOCALE`,
or `?jule_locale=<code>` in the page URL) → the browser's language list (`navigator.languages`) →
`defaultLocale`.
Matching is exact first (`pt-BR`), then by base language (`es-MX` → `es`). Only enabled locales
can win; an unknown preference falls back to the default. There is no language switcher inside
the widget: the host page decides, or the visitor's browser does. Hosted pages (preference
centers, landing pages) resolve the same way from the request's `Accept-Language`, including the
`<title>` and meta description.

## What is translated, per item type

Each item's `config.i18n` is `{ "<locale>": { "<field>": "<translation>" } }`. The translatable
fields are fixed per type; a key outside the list is stored but never read.

| Type                             | Fields in `config.i18n[locale]`                                                                                                                                                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`, `success_message`        | `content`, `errorContent`                                                                                                                                                                                                                                                                                                                                    |
| `button`                         | `label`                                                                                                                                                                                                                                                                                                                                                      |
| `input`                          | `placeholder`; option labels as `options: { "<option value>": { "label": "…" } }` (values are never translated — logic rules and Iterable read the value)                                                                                                                                                                                                    |
| `checkbox-group`                 | `label`; option labels as `options: { "<option id>": { "label": "…" } }`                                                                                                                                                                                                                                                                                     |
| `group`                          | `title`                                                                                                                                                                                                                                                                                                                                                      |
| `preference-category`            | `title`, `description`                                                                                                                                                                                                                                                                                                                                       |
| `html-block`                     | `html` (the whole block; `css` and `javascript` are shared)                                                                                                                                                                                                                                                                                                  |
| `coupon`                         | `success_text`, `description_text`, `shop_now_label`, `wheel_center_text`, `spin_button_label`, `prompt_text`, `label_template`; nested screens and slices under dotted keys `error_screen.title`, `error_screen.message`, `error_screen.btn_text`, `expiry_screen.title`, `expiry_screen.message`, `expiry_screen.btn_text`, `wheel_segments.<index>.label` |
| `logo`, `icon`, `flex`, `rating` | nothing (`altText`, rating `valueMap` and Box titles are not translated)                                                                                                                                                                                                                                                                                     |

The widget's own coupon chrome (toasts, "Spin to win", timer units) is translated for a few
languages by the widget itself and falls back to English elsewhere — nothing to author.

Project level:

- `style_config.i18n[locale]` — `preference_center_header_html`, `preference_center_footer_html`,
  `seo_page_title`, `seo_meta_description`, `notification_success_text`,
  `notification_error_text`. CSS, JS and URLs are shared across languages.
- `settings_config.sign_up_config.i18n[locale]` — `bubble_text` (the teaser text) and the legacy
  `success_message`.
- `style_info.i18n[locale]` — per-language style overrides on an item (a smaller `fontSize` for a
  long German label, a different `fontFamily` for Arabic); merged over the base styles.

Not translated: `fieldName`, option `value`s, URLs, `altText`, placeholders in Iterable custom
fields, trigger and targeting settings, the email deliverability message beyond `es`/`fr`/`de`.

## Right-to-left

With `directions[locale] = "rtl"` the widget sets `dir="rtl"` on its root for that language:
text aligns right, inputs and option cards mirror, a two-column popup swaps its columns visually,
and `textAlign: "left"` written for the base language becomes the trailing edge. Keep the base
alignment logical (omit `textAlign` or use `center`) rather than fighting it per item, and use
`style_info.i18n.ar` for an Arabic font (`fontFamily` + `fontUrl`) when the brand font has no
Arabic glyphs. Numbers, prices and codes stay left-to-right inside RTL text on their own.

## Missing translations

- A field without a translation for the active language shows the **base** string. Partial
  translations therefore never break a page, but they read as mixed-language to the visitor.
- `validate_project_document` (and every save) warns once per enabled locale that is missing a
  translation on any text-bearing field, naming the page, item and field, so you can fill the
  gaps before the user sees them; the same warning names an RTL locale without a `directions`
  entry.
- Translate whole pages at a time, including button labels and consent texts; a German form with
  an English "Subscribe" button is the most common miss.
- Keep `{{profileField}}`, `{% fieldName %}` and `{% __score__ %}` placeholders verbatim inside a
  translation.
- HTML inside `content` (`<p>`, `<strong>`, `<a href>`) must be reproduced in the translation; the
  widget sanitizes each language separately.

## Adding a language to an existing project

1. `get_project`; add the code to `enabledLocales` (and `directions` when RTL).
2. For every item type in the table above, add `config.i18n["<code>"]` with each field
   translated; add `style_config.i18n` and `sign_up_config.i18n` entries where the project uses
   those fields.
3. `validate_project_document` → no locale warning → `save_project_document`.
4. Preview with the language forced: append `&locale=<code>` is **not** supported by the preview
   page; instead check the translations in the editor's language menu, or ask the user to open the
   preview in a browser whose first language is the new one.
