#!/usr/bin/env node
// Maintainers only. Keeps the kit's knowledge identical to what the Jule MCP server serves.
//   JULE_SERVER_SRC=/path/to/server/source node scripts/sync-references.mjs          rewrite generated files
//   JULE_SERVER_SRC=/path/to/server/source node scripts/sync-references.mjs --check  exit 1 on drift
// Generated: skills/*/references/*, the <!-- sync:NAME --> blocks in SKILL.md files, and the rule
// copies (GEMINI.md, .cursor/rules, .windsurf/rules) rendered from the hand-written AGENTS.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
if (!process.env.JULE_SERVER_SRC) {
  console.error('set JULE_SERVER_SRC to the Jule server source checkout');
  process.exit(2);
}
const MCP = join(resolve(process.env.JULE_SERVER_SRC), 'src', 'mcp');
if (!existsSync(join(MCP, 'prompts', 'index.ts'))) {
  console.error(`no server source at ${MCP}`);
  process.exit(2);
}

const read = (p) => readFileSync(p, 'utf8');
const out = new Map(); // kit-relative path → expected content

// 1. Catalogs, schema and examples: byte copies.
const COPIES = {
  'skills/jule-builder/references/item-catalog.md': 'resources/item-catalog.md',
  'skills/jule-builder/references/project-style.md': 'resources/project-style.md',
  'skills/jule-builder/references/settings.md': 'resources/settings.md',
  'skills/jule-builder/references/layout.md': 'resources/layout.md',
  'skills/jule-builder/references/responsive.md': 'resources/responsive.md',
  'skills/jule-builder/references/languages.md': 'resources/languages.md',
  'skills/jule-builder/references/best-practices.md': 'resources/best-practices.md',
  'skills/jule-builder/references/document-schema.json': 'schema/project-document.schema.json',
  'skills/jule-builder/references/examples/popup.json': 'schema/fixtures/popup-multilingual-coupon.json',
  'skills/jule-builder/references/examples/preference-center.json': 'schema/fixtures/preference-center-iterable.json',
  'skills/jule-builder/references/examples/landing-page.json': 'schema/fixtures/landing-page-layout.json',
  'skills/jule-builder/references/examples/landing-page-classes.json': 'schema/fixtures/landing-page-classes.json',
  'skills/figma-to-jule/references/figma-mapping.md': 'resources/figma-mapping.md',
  'skills/figma-to-jule/references/item-catalog.md': 'resources/item-catalog.md',
  'skills/figma-to-jule/references/project-style.md': 'resources/project-style.md',
  'skills/figma-to-jule/references/layout.md': 'resources/layout.md',
  'skills/figma-to-jule/references/best-practices.md': 'resources/best-practices.md',
  'skills/jule-analytics/references/best-practices.md': 'resources/best-practices.md',
};
for (const [dest, src] of Object.entries(COPIES)) out.set(dest, read(join(MCP, src)));

// 2. Prompt blocks (plain template literals without ${}).
const prompts = read(join(MCP, 'prompts', 'index.ts'));
const literal = (name) => {
  const m = prompts.match(new RegExp(`\\nconst ${name} = \`\\n?([\\s\\S]*?)\`;`));
  if (!m) throw new Error(`prompts/index.ts: const ${name} not found`);
  if (m[1].includes('${')) throw new Error(`prompts/index.ts: ${name} has interpolation; extend the script`);
  return m[1].trim();
};
const analyze = prompts.match(/\nSteps:\n([\s\S]*?)`;/);
if (!analyze) throw new Error('prompts/index.ts: analyze-project Steps not found');

// 3. Metric definitions → markdown table.
const helpers = read(join(MCP, 'tools', 'analytics.helpers.ts'));
const defs = helpers.match(/METRIC_DEFINITIONS = \{([\s\S]*?)\} as const;/);
if (!defs) throw new Error('analytics.helpers.ts: METRIC_DEFINITIONS not found');
const rows = [...defs[1].matchAll(/(\w+):\s*'((?:[^'\\]|\\.)*)'/g)].map(
  ([, key, text]) => `| \`${key}\` | ${text.replace(/\\'/g, "'")} |`,
);
if (rows.length < 10) throw new Error('analytics.helpers.ts: METRIC_DEFINITIONS parsed too few rows');

const BLOCKS = {
  WORKFLOW: literal('WORKFLOW'),
  POPUP: literal('POPUP'),
  PREFERENCE_CENTER: literal('PREFERENCE_CENTER'),
  LANDING_PAGE: literal('LANDING_PAGE'),
  FIGMA: literal('FIGMA'),
  ANALYZE_STEPS: `Steps:\n${analyze[1].trim()}`,
  METRICS: ['| Field | Meaning (the dashboard\'s words) |', '|---|---|', ...rows].join('\n'),
};
out.set(
  'skills/jule-analytics/references/metrics.md',
  `# Metric definitions\n\nWhat every field of \`analytics_overview\` means — the same text the tool returns under \`definitions\`.\n\n${BLOCKS.METRICS}\n`,
);

// SKILL.md files: replace what sits between <!-- sync:NAME --> and <!-- /sync:NAME -->.
for (const skill of ['jule-builder', 'figma-to-jule', 'jule-analytics']) {
  const rel = `skills/${skill}/SKILL.md`;
  const current = read(join(KIT, rel));
  const next = current.replace(
    /<!-- sync:(\w+) -->[\s\S]*?<!-- \/sync:\1 -->/g,
    (_, name) => {
      if (!BLOCKS[name]) throw new Error(`${rel}: unknown sync block ${name}`);
      return `<!-- sync:${name} -->\n${BLOCKS[name]}\n<!-- /sync:${name} -->`;
    },
  );
  out.set(rel, next);
}

// 4. Rule copies from AGENTS.md (one body, host-specific frontmatter).
const RULE_DESCRIPTION =
  'Pop-ups, sign-up and newsletter forms, quizzes, surveys, preference centers, unsubscribe pages and landing pages (also from a Figma design) are built as Jule projects through the jule MCP, never as HTML/CSS/React files unless a standalone site is explicitly requested; coupons, triggers, A/B tests, translations, page logic, Iterable mappings, webhook subscriptions, branding and analytics of those projects go through the same server.';
const body = read(join(KIT, 'AGENTS.md')).trim() + '\n';
out.set('GEMINI.md', body);
out.set('.cursor/rules/jule.mdc', `---\ndescription: ${RULE_DESCRIPTION}\nglobs:\nalwaysApply: true\n---\n\n${body}`);
out.set('.windsurf/rules/jule.md', `---\ntrigger: always_on\ndescription: ${RULE_DESCRIPTION}\n---\n\n${body}`);

// 5. The three manifests must agree on the version (one release = one number).
const versions = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', 'gemini-extension.json'].map(
  (p) => [p, JSON.parse(read(join(KIT, p))).version],
);
if (new Set(versions.map(([, v]) => v)).size !== 1) {
  console.error('manifest versions differ:', versions.map(([p, v]) => `${p}=${v}`).join(', '));
  process.exit(1);
}

let drift = 0;
for (const [rel, content] of out) {
  const abs = join(KIT, rel);
  const same = existsSync(abs) && read(abs) === content;
  if (same) continue;
  drift++;
  if (CHECK) console.error(`drift: ${rel}`);
  else {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    console.log(`wrote ${rel}`);
  }
}
if (CHECK) {
  console.log(drift ? `${drift} file(s) out of date — run node scripts/sync-references.mjs` : `in sync (${out.size} files, version ${versions[0][1]})`);
  process.exit(drift ? 1 : 0);
}
console.log(`${drift} file(s) updated, ${out.size - drift} unchanged`);
