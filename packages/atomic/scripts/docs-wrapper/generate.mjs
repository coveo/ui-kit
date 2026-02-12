#!/usr/bin/env node

/**
 * Post-build script that generates a custom docs wrapper for Storybook.
 *
 * Reads `dist-storybook/index.json` and produces a single-page `index.html`
 * with a Coveo-branded header, a left sidebar nav tree, and an iframe
 * that loads Storybook stories via `iframe.html?id=…`.
 *
 * The original Storybook manager UI is moved to `storybook-ui/index.html`
 * so it remains accessible for contributors who need addon panels.
 */

import {existsSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateSidebar} from './sidebar.mjs';
import {buildPageHtml} from './template.mjs';
import {buildTree} from './tree.mjs';
import {writeOutput} from './writer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DIST = resolve(__dirname, '../../dist-storybook');
const INDEX_JSON = resolve(DIST, 'index.json');

if (!existsSync(INDEX_JSON)) {
  console.error(
    '❌  dist-storybook/index.json not found — run `storybook build` first.'
  );
  process.exit(1);
}

// ── Read inputs ────────────────────────────────────────────────────────────

const {entries} = JSON.parse(readFileSync(INDEX_JSON, 'utf-8'));

const inlineCss = readFileSync(resolve(__dirname, 'styles.css'), 'utf-8');
const clientJs = readFileSync(resolve(__dirname, 'client.js'), 'utf-8');

const managerHeadPath = resolve(
  __dirname,
  '../../.storybook/manager-head.html'
);
const cookieScripts = existsSync(managerHeadPath)
  ? readFileSync(managerHeadPath, 'utf-8')
  : '';

// ── Generate ───────────────────────────────────────────────────────────────

const DEFAULT_STORY = 'introduction--docs';

const tree = buildTree(entries);
const sidebarHtml = generateSidebar(tree);
const pageHtml = buildPageHtml({
  sidebarHtml,
  inlineCss,
  cookieScripts,
  clientJs,
  defaultStory: DEFAULT_STORY,
});

// ── Write ──────────────────────────────────────────────────────────────────

writeOutput(DIST, pageHtml, entries);
