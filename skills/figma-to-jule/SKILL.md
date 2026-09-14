---
name: figma-to-jule
description: >
  Turn a Figma design — a frame, file or node URL, "this mockup", "the design in Figma" — into a
  pop-up, sign-up form, quiz, preference center or hosted landing page as a Jule project, by
  reading the design through the Figma MCP server and mapping it to Jule items and styles. Use for
  "build a landing page from this Figma", "convert this design to a pop-up", "implement this frame
  in Jule", "make this Figma form live". Never writes HTML, CSS or React from the design unless the
  user explicitly asks for a standalone site.
license: MIT
---

# From a Figma design to a Jule project

"Build this from the Figma design" is a Jule task, not a coding task: the deliverable is a Jule
project the user can preview and publish from their dashboard, not a `styles.css`. Read the design
with the Figma MCP server's tools, then author the Jule document with the mapping below. If the
user wants a standalone website instead, they will say so; when unclear, ask first.

Both MCP servers must be connected: Figma's (for the design) and `jule`
(`https://api.jule.ai/mcp`). If either is missing, say which and stop.

## Mapping rules

The text below is the server's own `figma-to-jule` prompt, kept identical by
`scripts/sync-references.mjs`. `jule://docs/figma-mapping` is `references/figma-mapping.md` here;
`jule://docs/item-catalog` and `jule://docs/project-style` are `references/item-catalog.md` and
`references/project-style.md`.

<!-- sync:FIGMA -->
Also read jule://docs/figma-mapping (or whoami with doc "figma-mapping") before drafting.
- Get the design from the Figma MCP server: use its design-context and metadata tools for the node the user points at. Read structure, layout mode, padding, gaps, alignment, sizes, fills, strokes, radii, effects and text styles from that data. Never measure from a screenshot; use screenshots only to compare the Jule preview with the design.
- Map per the mapping guide: auto-layout frame → flex Box (flexDirection, gap, padding, alignItems, justifyContent); frame with overlapping children → stack Box with pinned children; repeated cells → grid Box; text → text items with the tag chosen by hierarchy; rectangles with image fills → logo items (they need a hosted URL); vectors → icon items only when the workspace icon library has them; buttons → button; fields → input. Only what is left after that mapping — embedded video, a third-party widget, a table, complex vector art — may become an html-block, one node at a time; never a frame, section or screen that contains text, images, buttons or fields, and never as a shortcut for a layout that is hard to express (split it into Boxes and items, or note the approximation to the user).
- Colors: match Figma variables and styles to the workspace brand colors by value and write brand:<name>; otherwise use the hex.
- List what could not be mapped faithfully before saving; import is approximate by design.
- Variants: when the design labels alternatives (Variant A / Variant B, or two versions of the same screens), it is one project plus one A/B test — build the project from variant A, then call create_experiment with variant B's full document (variants[].document); do not ask whether to build a test and do not publish anything for it. Tell the user the test exists as a draft and starts when they say so.
- Choose the project type from the brief (pop-up, preference center or landing page), then follow the workflow.
<!-- /sync:FIGMA -->

## Then build it

Pick the project type from the brief and apply that type's rules from the `jule-builder` skill
(`../jule-builder/SKILL.md`: Pop-ups, Preference centers, Landing pages), then follow the
workflow — the same text the server sends:

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

## Fidelity

Thirteen item types cannot represent every design. Sections, columns, overlaps, text, images by
URL, icons from the workspace library, buttons and inputs map cleanly; everything else becomes an
`html-block` or a note to the user. List what did not map before saving, and compare the Jule
preview with a Figma screenshot afterwards — never measure from the screenshot.
