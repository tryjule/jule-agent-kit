# Jule Product Docs

The public Jule documentation at https://docs.jule.ai explains every part of the product for the people who use it: installing the widget, the editor, display rules, coupons, preference centers, A/B tests, analytics, workspace settings, the JavaScript API, webhooks and this connection. Every page is also published as plain Markdown, written for assistants to read.

## When to read it

The tools and the live `jule://workspaces/{id}/*` resources say what is true for this user's workspace right now; the docs say how the product works in general. Read the docs when:

- the user asks how a Jule feature works, what an option means, or what they should do next ("how do I install this on my site?", "what does frequency capping do?", "how are webhooks signed?");
- a task ends in a step the user takes in the dashboard or on their own site — installing the embed snippet, connecting Iterable, setting a custom domain, inviting teammates, creating a webhook destination — so you can give them the exact steps and the page to follow;
- something these tools cannot do has to be pointed at: link the page that shows the dashboard way.

When a page and a tool result disagree, the tool result is what this workspace has; say so.

## How to read it

1. **The index** — https://docs.jule.ai/llms.txt lists every page with a one-line summary and its Markdown link. Read it first to pick the page.
2. **One page** — add `.md` to any docs URL: https://docs.jule.ai/getting-started/embed-your-widget.md is the Markdown of https://docs.jule.ai/getting-started/embed-your-widget. Each page carries its title, summary, headings, tables, every code tab and image links.
3. **Everything at once** — https://docs.jule.ai/llms-full.txt holds every page in one file, each inside `<page url="…">`. Use it for broad questions; prefer single pages otherwise, it is large.

Fetch these with whatever reads a web page where you run (a fetch or browser tool). When you cannot fetch URLs, give the user the link instead of guessing at its content. When you quote the docs to the user, link the page without `.md` — that is the page people read.

## Where things are

| The user asks about | Page |
|---|---|
| Installing the widget, the embed snippet, inline placement | https://docs.jule.ai/getting-started/embed-your-widget |
| Script attributes, `window.Jule.show()`, `window.JULE_USER_DATA` | https://docs.jule.ai/developers/widget-script, https://docs.jule.ai/developers/javascript-api |
| Connecting Iterable, what syncs on submit, triggered journeys | https://docs.jule.ai/iterable/connect, https://docs.jule.ai/iterable/audience-sync, https://docs.jule.ai/iterable/triggered-campaigns |
| Elements, pages and buttons, logic, styling, languages, versions | https://docs.jule.ai/widgets/elements (and the other pages under /widgets) |
| Display modes, triggers, targeting, frequency, custom events | https://docs.jule.ai/display/modes (and the other pages under /display) |
| Coupons, QR codes, Iterable coupon sync, Stripe and Shopify codes | https://docs.jule.ai/coupons/overview (and the other pages under /coupons) |
| Preference centers, channels, custom domain, unsubscribe | https://docs.jule.ai/preference-center/overview, https://docs.jule.ai/preference-center/custom-domain |
| A/B tests: setup, reading results, the statistics | https://docs.jule.ai/ab-testing/setup, https://docs.jule.ai/ab-testing/results |
| Analytics numbers and event definitions | https://docs.jule.ai/analytics/overview, https://docs.jule.ai/analytics/events |
| Workspace settings, team and roles, security, branding, assets | https://docs.jule.ai/workspace/team-and-roles (and the other pages under /workspace) |
| Webhook payloads and signature checks | https://docs.jule.ai/developers/webhooks |
| Connecting an assistant, access tokens, limits, the tool list | https://docs.jule.ai/developers/mcp, https://docs.jule.ai/developers/mcp/tools |
| End-to-end recipes (exit intent, spin to win, SMS double opt-in, embedded form, hosted preference center, A/B test a welcome offer) | https://docs.jule.ai/guides |

The index at https://docs.jule.ai/llms.txt is the complete list; this table is a shortcut.
