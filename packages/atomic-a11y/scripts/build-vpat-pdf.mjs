/**
 * build-vpat-pdf.mjs
 *
 * Generates a VPAT PDF for CDN deployment from the committed openacr.yaml.
 * Renders to HTML via the existing Handlebars template, then to PDF via Playwright.
 * Skips if content hasn't changed (hash-based).
 */
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {parse} from 'yaml';
import {marked} from 'marked';
import {chromium} from 'playwright';
import {renderVpat} from '../dist/index.js';

const PKG_ROOT = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const OUTPUT_PATH = resolve(REPO_ROOT, 'packages/atomic/cdn/vpat.pdf');
const HASH_FILE = resolve(PKG_ROOT, '.vpat-pdf.sha256');
const OPENACR_FILE = resolve(PKG_ROOT, 'reports/openacr.yaml');
const CATALOG_FILE = resolve(PKG_ROOT, 'a11y/catalog/2.5-edition-wcag-2.2-508-eu-en.yaml');
const TEMPLATE_FILE = resolve(PKG_ROOT, 'scripts/vpat-from-openacr.handlebars');

if (!existsSync(OPENACR_FILE)) {
  console.log(`[build-vpat-pdf] Skipped: openacr.yaml not found at ${OPENACR_FILE}`);
  process.exit(0);
}

// Step 1: Read committed openacr.yaml and render to markdown
console.log('[build-vpat-pdf] Rendering VPAT from committed openacr.yaml...');
const openAcrReport = parse(readFileSync(OPENACR_FILE, 'utf8'));
const catalog = parse(readFileSync(CATALOG_FILE, 'utf8'));
const templateSource = readFileSync(TEMPLATE_FILE, 'utf-8');
const markdown = renderVpat(openAcrReport, catalog, templateSource);

// Step 2: Convert markdown to styled HTML
const body = await marked(markdown, {gfm: true});
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>VPAT</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;line-height:1.5;color:#1a1a1a;max-width:900px;margin:0 auto}
h1{font-size:18pt;margin:0 0 8px}h2{font-size:14pt;margin:28px 0 12px;border-bottom:2px solid #e0e0e0;padding-bottom:6px}
table{width:100%;border-collapse:collapse;margin:12px 0 20px;page-break-inside:auto}
th,td{border:1px solid #ccc;padding:8px 10px;text-align:left;vertical-align:top}
th{background:#f5f5f5;font-weight:600}tr{page-break-inside:avoid}
ul{margin:8px 0;padding-left:24px}li{margin:4px 0}p{margin:8px 0}
</style></head><body>${body}</body></html>`;

// Step 3: Skip if content unchanged
const htmlHash = createHash('sha256').update(html).digest('hex');
if (existsSync(OUTPUT_PATH) && existsSync(HASH_FILE)) {
  if (readFileSync(HASH_FILE, 'utf-8').trim() === htmlHash) {
    console.log('[build-vpat-pdf] Skipped (content unchanged).');
    process.exit(0);
  }
}

// Step 4: Generate PDF via Playwright
console.log('[build-vpat-pdf] Generating PDF via Playwright...');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, {waitUntil: 'networkidle'});
const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: {top: '0.75in', bottom: '0.75in', left: '0.5in', right: '0.5in'},
});
await browser.close();

mkdirSync(dirname(OUTPUT_PATH), {recursive: true});
writeFileSync(OUTPUT_PATH, pdfBuffer);
writeFileSync(HASH_FILE, htmlHash);
console.log(`[build-vpat-pdf] Written: ${OUTPUT_PATH}`);
