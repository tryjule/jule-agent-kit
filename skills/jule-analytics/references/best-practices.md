# Jule Best Practices

How to design a pop-up, form, quiz, preference center or landing page that converts, stays legal
and works on a phone — written as Jule fields. Read this before drafting, alongside
`jule://docs/item-catalog`, `jule://docs/project-style`, `jule://docs/layout` and
`jule://docs/settings`, and again before you save.

Three labels mark how much room you have:

- **[HARD]** — a legal requirement, an accessibility rule, a platform policy or a rule of this
  widget. Do not ship a project that breaks one; if the user asks for it anyway, say what the
  risk is, do what they asked and note it.
- **[CONVENTION]** — the safe default. Follow it unless the brief says otherwise.
- **[CONTESTED]** — practitioners disagree and the evidence is mixed. Pick one, say it is a
  guess, and offer an A/B test (`create_experiment`) instead of asserting it works.

Defaults to fall back on when the brief is silent: pop-up after a 10-second delay, email as the
only field, `until_completed` frequency, one column, labels above fields, one goal per project,
no backdrop, no navigation on a landing page.

## Rules that fail a review

Check these before every save. Each one is [HARD].

1. **Never invent proof.** No testimonial, customer name, logo, star rating, review count,
   subscriber count, press mention, statistic, award or "trusted by" number unless the user gave
   it. A landing page with no real proof gets a section the user can fill, or no section.
2. **Consent boxes start unchecked.** A `checkbox` input used for consent carries no truthy
   `defaultValue`, and a checkbox-group option no `checked: true`. Pre-ticked consent is invalid
   under GDPR and CASL. Preference-center toggles are the exception: they show the subscriber's
   real current state.
3. **Link the privacy policy next to what captures data.** A `text` item with `tag: "a"` and
   `href` from branding `legal.privacy_policy_url`, on the page that holds the fields.
4. **Every field has a real label.** `placeholder` is the label a visitor reads in Jule, so it
   must name the field, not hint at it. Never leave an input with an empty `placeholder`.
5. **A phone field needs its disclaimer.** A `tel` input must be paired with a `text` item whose
   `isSmsDisclaimer` is true and whose `linkedPhoneInputId` points at it, carrying the workspace
   `legal.sms_disclaimer` text.
6. **A preference center always offers a global unsubscribe**, never behind a login, a survey or
   a second step. Use the `unsubscribe_all` or `both` helper checkbox.
7. **Every page except the last has a way forward or out** (a `next`/`submit*`/`redirect`/`close`
   button, or a `submitOnSelect` input). Never set `style_config.hide_next`.
8. **Nothing is an `html-block` that an item can be.** Headings, copy, images, links, fields,
   buttons, sections and pages are items. A block is for an embed, a table or custom vector art.
9. **Copy is the user's, not yours to embellish.** Do not add claims, numbers, dates, prices,
   guarantees or deadlines the brief does not contain.

## Before you draft

1. Read `jule://workspaces/{id}/branding`: use `brand:<name>` colors, the workspace font
   (`fontFamily` + `fontUrl`), a branding logo, the legal texts (privacy URL, SMS disclaimer) and
   the style classes (`element_presets`): when a class exists for the element you are placing,
   bind it (`config.presetIds` + its `style` in `style_info`) instead of hand-rolling the style.
   When the workspace carries none of it — no brand colors, no font, no usable logo — do not stop
   to ask for a hex. Take the palette and the font from what you already have (the design, the
   logo, the site the brief names, the product's own words), say in one line what you chose and
   why, and build with it; the user changes it in Branding afterwards. Ask only when there is
   nothing to take them from.
2. Read `jule://workspaces/{id}/integrations`: Iterable connected and active? Which lists,
   channels and message types exist? Are coupons enabled, is a provider connected? Never add a
   channels group, Iterable list ids or a coupon item the workspace cannot honour.
3. Decide the type: `popup` (embedded on the customer's site), `preference_center` (hosted, with a
   channels group), landing page (hosted `preference_center` without a channels group).
4. Name the one goal and the one action that reaches it. Everything else on the page either
   supports that action or comes out. A second goal means a second project.
5. Start from a template when one fits (`list_templates`); it carries a working structure and
   the project's frozen style defaults.
6. Build from Jule items, not raw HTML. Headings and copy are `text`, pictures `logo`, calls to
   action `button`, fields `input`, layout `flex` Boxes (`jule://docs/layout` says how a row sizes
   its children — an input beside a button needs its own Box — and holds the section recipes); that is what the customer can edit,
   translate, brand, adapt and measure in the dashboard. An `html-block` is only for what the
   items cannot show (embedded video, third-party widgets, tables, custom vector art) — never a
   heading, paragraph, image, field, button, section or page. Validation warns when a block holds
   page content or form controls; say which parts fell back to it and why.

## Pop-ups

**Structure**

- **[CONVENTION] One goal, one primary action per page.** Page 1 collects (heading, one supporting
  sentence, the fields, the button). Page 2 thanks or rewards (a `success_message` or a `coupon`
  item plus a `close` button). Two pages is the common shape; three or more only for quizzes with
  logic rules.
- **[CONVENTION] Order inside page 1:** heading (the offer) → one supporting line → the field(s) →
  the button → consent checkbox or fine print where the law needs it. The decline path is the
  close button; keep it visible.
- **[CONVENTION] Ask for the minimum.** Email alone converts best; cutting non-essential fields
  routinely multiplies sign-ups without raising bounce. Add `tel` only when SMS is the channel
  (it requires the linked disclaimer and a valid E.164 number to proceed). Collect the rest later
  or on a second page. Mark fields `required` deliberately: a required field blocks Next/Submit
  until valid.
- **[CONVENTION] Quantified value beats urgency.** "Save $25" outperforms "Hurry, ends soon" in
  most tests. Say what the visitor gets, in their number.
- **[CONVENTION] Put a short code in the pop-up** rather than promising it by email — a `coupon`
  item on page 2 with `success_text` and `shop_now_url` filled, `show_expiry` only when the coupon
  has an expiry.
- **[CONTESTED] Multi-step micro-commitment** (one yes/no question first, the offer on page 2) has
  produced large lifts for some audiences and nothing for others. Offer it as an A/B test, not as
  a fact.
- **[CONTESTED] Gamified formats** (spin-to-win built as option cards with logic rules) report
  higher conversion than static pop-ups. Test before claiming it. If you build one, make the
  prizes materially different from each other.
- **[HARD] A way forward on every page.** Each page except the last ends with exactly one forward
  button: `next` while the form continues, `submit` on the page where it ends. Submit once per
  visit — a `submit_and_next` followed by more questions loses their answers. The thank-you page
  holds text (or a `success_message` / `coupon` item) and a `close` or `redirect` button, no
  forward action.
- **[HARD] Always give a way out.** Popup and bubble modes render the close button; keep
  `banner_show_close_button` on for banners. `close` and `redirect` buttons skip validation so a
  visitor can leave with an unfinished form.
- **[HARD] Keep `sign_up_config` present** (`{ "display_mode": "popup" }` minimum) — it is what
  turns on the `success_message` reveal.

**When it shows**

- **[CONVENTION] Wait 10–50 seconds** (`trigger_type: "delay"`, `trigger_delay: 10`). Firing in
  the first few seconds raises bounce sharply. A rough rule: half the average time on the page.
- **[CONVENTION] Second-visit beats first-second.** Jule triggers on `immediate`, `delay`,
  `scroll` (try `trigger_scroll_depth: 50`), `exit_intent` or `manual`; there is no
  second-pageview trigger, so a delay or a scroll depth is how you wait for intent.
- **[CONVENTION] Exit intent is a recovery net, not an acquisition trigger,** and it is desktop
  only — cursor-leave does not exist on a touch screen. Pair it with `trigger_mobile_enabled: false`
  and give phones a delay or scroll trigger instead.
- **[CONVENTION] Frequency.** `until_completed` is right for lead capture; `cooldown` for
  recurring promotions. Never show the same offer twice in a day.
- **[HARD] Keep it off the pages that earn money.** Use targeting conditions to exclude cart and
  checkout URLs, and do not show an incentive to visitors who already subscribed or just bought.
- **[HARD] Search-arrival pages.** A pop-up that covers the content of the page a visitor lands on
  from mobile search can cost the site its ranking. Consent notices, age gates and login dialogs
  are exempt, as are small banners and teasers. On mobile prefer `bubble` or `banner` mode, or a
  delay long enough that the visitor has read something first.
- **[CONVENTION] Attach a workspace trigger** via `trigger_id` rather than writing `trigger_*`
  fields; the linked trigger overwrites them.

**Look**

- **[CONVENTION] The card is a layer over the page, not a replacement.** `card_width` up to `480px`
  on desktop, `400px` or `90%` on a phone; the site stays visible around it.
- **[CONVENTION] No backdrop unless the brief asks for one.** Then `overlay_color` as 8-digit hex
  (`#00000080` dims 50%); a 6-digit hex is opaque and hides the site.
- **[CONVENTION] The button is the loudest thing in the card** — highest contrast, looks like a
  button, appears once. Decorative or script fonts stay on the headline; labels, buttons and error
  text use plain high-contrast type.
- **[CONVENTION] Hide big imagery on a phone** (`visibility.hideOnMobile`) — large images in a
  small card push the action below the fold and cost more than they add.

**Do not**

- Show a pop-up before the page has content, stack two pop-ups, or interrupt checkout, payment or
  account recovery.
- Ask for an email before the visitor has done anything.
- Use a blocking modal for a cookie or privacy notice; a banner belongs at the edge of the page.
- Disguise the close button, shame the decline ("No thanks, I hate saving money"), or run a
  countdown that resets on reload.

## Forms, quizzes and surveys

- **[CONVENTION] One column.** Single-column forms are completed faster and skip fewer fields than
  two-column ones. In a row Box only a nested Box grows, so an input beside a button needs its own
  Box (`jule://docs/layout`); two fields side by side belong in a `grid` Box that collapses to
  `1fr` on mobile.
- **[HARD] The label is `placeholder` in Jule** and it does not disappear on focus, so write the
  field name, not a hint ("Work email", not "you@company.com" alone).
- **[CONTESTED] Field count is not the lever people think it is.** Sensitive fields (phone,
  company size, budget) cost far more completion than neutral ones, and cutting fields has
  backfired where it left the remaining ones ambiguous. Move sensitive fields to a later page
  instead of deleting them, and mark what is optional rather than what is required when most
  fields are required.
- **[CONVENTION] Use the right `inputType`** (`email`, `tel`, `number`, `date`, `time`, `url`) so
  the phone shows the right keyboard and the value validates. Turn on `emailTypoCheck` for email.
  `date` / `time` render native pickers; never rebuild them as text inputs.
- **[CONVENTION] `defaultValue` and `urlPrefillParam`** carry what you already know instead of
  asking for it again, and a multi-page flow must never ask twice for the same answer.
- **[CONVENTION] One question per screen for a quiz,** 5–8 questions; completion falls off after
  eight. Order them easy first, and keep the heaviest question out of the first two screens.
- **[HARD] The widget renders no progress bar** (`hide_progress` is legacy and does nothing). Write
  progress yourself: a small `text` item at the top of each page — "Question 3 of 5".
- **[CONVENTION] Prefer choices to typing:** `radio`, `single-select` or `dropdown` with 3–5
  options; past six options a `dropdown` beats cards. `submitOnSelect` removes the extra tap on a
  one-choice page.
- **[CONTESTED] Where to ask for the email in a quiz.** Gating the result collects more addresses
  and finishes fewer quizzes; asking after the result keeps completion. Showing the result and
  offering to email it does well on both. Say which one you chose and why, and offer the test.
- **[CONVENTION] The result page is the least-tested, highest-leverage screen** in a quiz. Give it
  a real recommendation, a reason, and one button that acts on it — not just "Thanks".
- **[CONVENTION] Error text says what is wrong and how to fix it.** Use `validation` (length,
  range, pattern) so the widget can be specific instead of failing silently.

## Preference centers

- **[HARD] Channels group from live data.** Build the `iterableChannelsGroup` structure with the
  exact channel and message-type ids from the integrations resource; mirror them in
  `settings_config.iterable_integration.channels` / `message_types`, set
  `preference_center_enabled: true` and `actions: ["update_profile"]`. Without an active Iterable
  connection a preference center cannot load or save subscriptions.
- **[CONVENTION] Frequency first.** "Too much email" is the most common reason people unsubscribe,
  so an opt-down (fewer emails, a pause, one topic instead of all) is the highest-value control on
  the page. Deployments that added it report large drops in unsubscribes. Order the page:
  frequency → topics → channels → pause → profile fields → unsubscribe from all.
- **[HARD] Defaults show the real current state,** never an aspirational one. Nobody is silently
  opted into anything they did not pick.
- **[CONVENTION] Explain, then toggle.** A heading and one paragraph above the group, plain-language
  checkbox labels (`placeholder` is the label), message types indented under their channel (the
  editor's defaults do this), helper checkboxes (`helperCheckbox: "both"`) for long lists. Say what
  each topic contains and how often it sends.
- **[CONVENTION] Keep it scannable.** Long flat lists of topics depress completion; group them
  under their channel rather than listing everything at one level.
- **[CONVENTION] Submit and feedback.** One `button` with `action: "submit"`; enable the
  notification toast (`notification_enabled`, success and error texts) and say plainly that the
  change is saved.
- **[HARD] Identity without a login.** Visitors arrive from Iterable emails with `?email=` /
  `?hash=` (turn on `use_token_validation` for signed links; the secret is set in the dashboard) or
  logged in via `window.JULE_USER_DATA`. Never ask someone who followed a tokenized link to retype
  their address.
- **[CONVENTION] Chrome.** `card_width: "100%"`, `card_padding: "0px"`,
  `display_mode: "whole_page"`, header and footer linked to branding
  (`preference_center_header_linked` / `_footer_linked`), SEO title and description filled.
- **[HARD] Compliance the page is part of.** Every commercial email needs a working opt-out that
  costs nothing but a click, honoured within the sender's legal window, plus the sender's physical
  address in the message. Consent must be specific, unticked and as easy to withdraw as to give.
  A global unsubscribe overrides every granular preference. One-click unsubscribe behaviour is set
  explicitly; the workspace-level setting lives in the dashboard.

## Landing pages

- **[CONVENTION — high leverage] One goal, one call to action, no navigation.** No header menu, no
  outbound links, no second offer. Repeating the same CTA down the page is fine; competing with it
  is not.
- **[CONVENTION] Section order:** hero (value proposition + CTA) → proof → benefits written as
  outcomes → objections / FAQ → final CTA → small footer with privacy, terms and contact only.
- **[CONVENTION] Above the fold:** headline, one line of what it is and who it is for, and the
  action — without crowding. On a phone that is roughly the first screen of a 390px-wide view, so
  check it in the mobile preview.
- **[HARD] Message match.** The headline echoes the ad, email or link that sent the visitor. If
  the user gave you the source copy, reuse its words.
- **[CONVENTION] Sections as Boxes.** One `flex` item per section with `config.htmlId` (`hero`,
  `features`, `pricing`) so header links scroll; `display: "grid"` for columns with
  `responsive.mobile.gridTemplateColumns: "1fr"`; `display: "stack"` only for overlaps (badges,
  captions over images).
- **[CONVENTION] Hosted chrome.** `display_mode: "whole_page"`, SEO fields (`seo_page_title`,
  `seo_meta_description` at 150–160 characters, `seo_og_image_url`, `seo_favicon_url`). The site
  navbar and the site footer are chrome, not sections: link them to the workspace
  (`preference_center_header_linked` / `preference_center_footer_linked: true`) or write them in
  `preference_center_header_html` / `_css` / `_js` and the footer fields. Rebuilding a navbar out
  of Boxes and text items is the usual mistake — it then scrolls away with the page, has to be
  repeated on every page you add and stops following branding. The custom domain is configured in
  the dashboard.
- **[CONVENTION] Images.** `logo` items take hosted URLs: a branding logo, an entry from
  `list_assets` (`url` key or `public_url`), or a file you upload with `upload_branding_asset`
  (`source.url` for a public URL, `source.base64` for a small file, `source.upload_link: true` for
  a file on the user's machine). Upload the user's real pictures and logo rather than drawing a
  substitute. Use `objectFit` and `width` to size them. Show the product in context; stock imagery
  of smiling strangers adds nothing.
- **[CONVENTION] Form placement.** Above the fold for a low-commitment offer (email for a
  discount); after the value is established for a demo, a quote or anything that asks for a phone
  number.
- **[CONVENTION] Forms on the page** are inputs + a `submit` button + a `success_message` item in
  the same section. Keep long lead forms to two pages rather than one tall one.
- **[HARD] Items, not HTML sections.** Every hero, feature grid, pricing row and footer is a `flex`
  Box holding `text`, `logo`, `icon` and `button` items — the editor-built marketing pages in Jule
  use no `html-block` at all. Inside a block nothing is editable per element, translated per field,
  branded, responsive or measured, and a form inside it is never submitted.
- **[CONTESTED] Video in the hero.** It sometimes lifts conversion and sometimes delays the action
  enough to cost it. Never autoplay with sound.

## Mobile

Most traffic to these surfaces is on a phone. Check the mobile preview before you call anything
done (`preview_project` with `device: "all"`, `review: true`).

- The widget's breakpoints are ≤768px (mobile) and ≤1024px (tablet). Use `visibility` to hide
  decorative items on mobile and `style_info.responsive.mobile` / `style_config.responsive.mobile`
  for size changes (font sizes, paddings, `card_width`, `gridTemplateColumns`).
- **[HARD] Input text stays at 16px or more on a phone.** `style_config.input_font_size` defaults to
  `16px` for this reason: below it a phone zooms the page on focus and the layout breaks. The same
  goes for `responsive.mobile` overrides of an input's `fontSize`.
- **[HARD] Tap targets ≥44px.** That is the real floor for a button, a close control or an option
  card, including its padding.
- **[CONVENTION] The action stays reachable with the keyboard open.** On a page with a field, keep
  the button directly under the last field rather than below a long block of text.
- Popup card: `card_width` up to `400px` fits phones; wider cards need a `responsive.mobile`
  `card_width` of `90%` or so. Two-column popups stack on mobile by default
  (`mobile_column_layout: "stacked"`); consider `mobile_hide_left_column` for image columns.
- Keep option cards (`radio`, `single-select`) to ≤6 options on a page; long lists belong in
  `dropdown`.
- `date` / `time` inputs render native pickers; do not replace them with text inputs.
- Everything must work at 320px wide without sideways scrolling.

## Accessibility

The widget already does the parts you cannot reach from the document: it labels the card as a
dialog, moves focus into it, traps focus while it is open, closes on Escape, restores focus on
close and honours reduced-motion. Do not try to rebuild any of that in an `html-block`. What is
yours:

- Every `logo` gets `altText`; decorative `icon` items keep `altText` empty (they are
  `aria-hidden`).
- Heading order: one `h1` per page, `h2`/`h3` beneath it; do not pick tags for size — use
  `fontSize`.
- Checkbox labels come from `placeholder`; write full sentences ("I agree to receive marketing
  emails"). Selection inputs need distinct `label`s per option.
- Contrast: 4.5:1 for body text, 3:1 for large text. Check brand colors used for text on the card
  background; the editor shows a contrast status for the current selection. Default text `#111827`
  on `#ffffff` passes.
- Never signal an error with color alone — the message text has to say what is wrong.
- Buttons need verbs ("Get my code", "Save preferences"), not "Submit".
- `tag: "a"` links to external sites should open in `_blank` (the widget adds
  `rel="noopener noreferrer"`).

## Writing the copy

Everything visible is copy the customer's audience reads: headlines, paragraphs, button labels,
`placeholder` labels, consent lines, success messages, coupon text, SEO description, channel and
topic labels. Write it the way the brand writes, not the way a chatbot writes.

**Length**

- Headline (`h1`): 3–8 words. Supporting paragraph: one sentence, ≤ 20 words. Button: 1–4 words.
- Consent sentence: one line, name the sender and the channel.
- Success message: one sentence plus what happens next ("Check your inbox for the code.").
- Teaser (`bubble_text`): ≤ 4 words; rectangles at `center-left`/`center-right` are rotated, so
  keep them very short.
- Preference-center intro: two sentences at most; channel labels ≤ 3 words, message types ≤ 5.
- Landing page section heading: under 10 words; body paragraph: two sentences.

**Patterns to keep out**

1. **No "not X but Y".** "It's not just a newsletter, it's a community" says nothing. State the
   thing: "A weekly email about X."
2. **No one-line closers or dramatic fragments.** Cut "That's the real win.", "Read that again.",
   "No fluff. No spam. Just value." A short line is fine when it carries a new fact.
3. **No staged run-ups.** "Let's dive in", "Here's the thing", "Here's what you need to know" —
   delete them and start with the point.
4. **No forced threes.** "Fresh, fast and fearless" is rhythm standing in for content. Use three
   items when there are three.
5. **No em dashes** (— or –) unless the brand's own copy uses them. A comma, a period or
   parentheses always works.
6. **Avoid the stock words:** crucial, seamless, elevate, unlock, robust, delve, deep dive,
   landscape, tapestry, testament, showcase, empower, transform, curated, discover, journey,
   game-changer, revolutionize, effortless, unleash, supercharge, next-level.
7. **No brochure voice:** boasts, nestled, breathtaking, stunning, must-have, world-class,
   cutting-edge, best-in-class. Say what the thing is.
8. **Use "is", "are", "has"** instead of "serves as", "stands as", "boasts", "features".
9. **No invented authority.** No "experts agree", no "as seen in", no follower counts, no
   "trusted by thousands" — see the hard rule above.
10. **No chatbot residue.** "Of course!", "Great choice!", "I hope this helps", "Let me know" never
    belong in a button, a heading or a success message.
11. **Sentence case for headings**, straight quotes, no emoji as decoration, and bold only where a
    word genuinely carries weight.
12. **Say what the button does for the visitor:** "Get my 15% code", not "Submit"; "Save my
    preferences", not "Update".

When the user gave you their own copy, a sample of their writing or an existing page, match it and
stop applying these rules where they contradict it. Their voice wins.

## Testing and measuring

- **[CONVENTION] Test in order of impact:** when it shows → the offer and how the value is framed →
  one step or several → layout → button styling. Starting at the bottom wastes the traffic.
- **[CONVENTION] Call a winner only after ~500 interactions per variant.** With less than that,
  say the test is not finished.
- **[CONVENTION] Change one thing per test.** Two changes in one variant tell you nothing about
  either.
- **[CONVENTION] Quote the dashboard's words and denominators** — views, opens, starts,
  submissions (leads), completions, conversion rate — and always name the period. Published
  "average conversion rates" for pop-ups range from 2% to 11% because every vendor counts
  differently; do not hand the user a benchmark as if it were a forecast.
- **[CONVENTION] Signals that should change the design:**

  | What you see | What to change |
  |---|---|
  | Mobile bounce rises after launch | Longer delay, or `bubble`/`banner` mode on phones |
  | Unsubscribes spike | Add frequency opt-down before rewriting content |
  | Submissions under 2% of views | Cut fields; move sensitive ones to a later page |
  | Drop-off concentrated on one quiz page | Reword it, cut options, or move it later |
  | Views but almost no opens | Trigger fires too early, or the teaser says nothing |

## Before you save

- Validate with `validate_project_document` and fix every error; then save with the version you
  read. Reread with `get_project` to learn the real ids before adding logic rules keyed by page.
- Read the warnings a save returns: they cover the dashboard's publish checks, layout, responsive
  and translation completeness, and the design rules above that a document can express.
- Preview (`preview_project` with `device: "all"` and `review: true`), look at the phone picture,
  fix what it lists, and describe what the user will see; publish only when the user asks after
  the preview, through the confirmation step.
