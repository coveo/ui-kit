// PROTOTYPE — loads a built CDN directory in headless Chromium and checks that every one of the
// 206 lazily loaded components still registers (the ADR's own first verification step).
// Requests to the production CDN path are served from the build directory instead.
// usage: node check-registration.mjs <buildDir> <pages.json>
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {chromium} from '@playwright/test';

const [buildDir, pagesPath, outPath] = process.argv.slice(2);
const tags = Object.keys(JSON.parse(readFileSync(pagesPath, 'utf8')).knownTags);
const CDN = 'https://static.cloud.coveo.com/atomic/v3/';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [],
  failed = [];
let served = 0;
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 160));
});
page.on('requestfailed', (r) => failed.push(r.url()));
await page.route(`${CDN}**`, (route) => {
  const file = join(buildDir, route.request().url().slice(CDN.length).split('?')[0]);
  if (!existsSync(file)) return route.fulfill({status: 404, body: 'missing: ' + file});
  served++;
  return route.fulfill({
    status: 200,
    contentType: file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream',
    body: readFileSync(file),
  });
});
await page.setContent(`<!doctype html><body>${tags.map((t) => `<${t}></${t}>`).join('')}</body>`);
await page.addScriptTag({url: `${CDN}atomic.esm.js`, type: 'module'});
const started = Date.now();
let defined = 0;
while (Date.now() - started < 60_000) {
  defined = await page.evaluate((tags) => tags.filter((t) => customElements.get(t)).length, tags);
  if (defined === tags.length) break;
  await page.waitForTimeout(250);
}
const missing = await page.evaluate((tags) => tags.filter((t) => !customElements.get(t)), tags);
console.log(
  `${buildDir}: ${defined}/${tags.length} components defined in ${((Date.now() - started) / 1000).toFixed(1)} s, ${served} files served, ${failed.length} failed requests, ${errors.length} console/page errors`
);
if (missing.length) console.log('missing:', missing.join(' '));
if (failed.length) console.log('failed:', failed.slice(0, 5).join('\n'));
const unique = [...new Set(errors)];
if (unique.length)
  console.log(
    'errors (unique):',
    unique
      .slice(0, 8)
      .map((e) => '\n  ' + e)
      .join('')
  );
if (outPath)
  writeFileSync(
    outPath,
    JSON.stringify({
      buildDir,
      defined,
      total: tags.length,
      served,
      failed: failed.length,
      errors: errors.length,
      missing,
    })
  );
await browser.close();
process.exit(missing.length || failed.length ? 1 : 0);
