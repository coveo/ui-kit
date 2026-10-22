import {existsSync, readFileSync} from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import path from 'node:path';
import {packageRoot} from '../manifest.mjs';
import {validateHtml} from '../snippets.mjs';

const require = createRequire(import.meta.url);
const requireFromSample = createRequire(
  path.join(packageRoot, '../../samples/atomic/search-vite/package.json')
);

const RENDER_TIMEOUT_MS = 25_000;

/**
 * Checks the `index.html` an agent wrote against the manifest, as the usage-doc lint does.
 */
export function checkLint(workspace, catalog) {
  const file = path.join(workspace, 'index.html');
  if (!existsSync(file)) {
    return {pass: false, problems: ['index.html was not written']};
  }
  const problems = validateHtml(readFileSync(file, 'utf8'), catalog).map(
    ({line, message}) => `index.html:${line} ${message}`
  );
  return {pass: problems.length === 0, problems};
}

async function mockHandlers(api) {
  const {MockSearchApi, MockCommerceApi, MockRecommendationApi} =
    await import('@coveo/platform-mock-api');
  const mock = {
    search: () => new MockSearchApi(),
    commerce: () => new MockCommerceApi(),
    recommendation: () => new MockRecommendationApi(),
  }[api]();
  return mock.handlers;
}

function serve(workspace) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const file = path.join(workspace, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!file.startsWith(workspace) || !existsSync(file)) {
      response.writeHead(404).end();
      return;
    }
    const type = file.endsWith('.html') ? 'text/html' : 'application/octet-stream';
    response.writeHead(200, {'Content-Type': type}).end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/**
 * Counts, through every shadow root, the items Atomic rendered and the errors it displayed.
 */
function inspectPage() {
  const counts = {items: 0, errors: 0, errorMessages: [], interfaces: 0};
  const seen = new Set();
  const visit = (root) => {
    for (const element of root.querySelectorAll('*')) {
      if (seen.has(element)) {
        continue;
      }
      seen.add(element);
      const tag = element.tagName.toLowerCase();
      if (['atomic-result', 'atomic-product', 'atomic-recs-result'].includes(tag)) {
        counts.items++;
      }
      if (tag === 'atomic-component-error') {
        counts.errors++;
        counts.errorMessages.push(element.error?.message ?? element.textContent.trim());
      }
      if (tag.startsWith('atomic-') && tag.endsWith('-interface')) {
        counts.interfaces++;
      }
      if (element.shadowRoot) {
        visit(element.shadowRoot);
      }
    }
  };
  visit(document);
  counts.atomicLoaded = Boolean(customElements.get('atomic-icon'));
  return counts;
}

/**
 * Loads the page in Chromium with the platform API mocked, and reports whether Atomic rendered
 * items without displaying an error.
 *
 * @param {string} workspace
 * @param {'search' | 'commerce' | 'recommendation'} api
 */
export async function checkRender(workspace, api) {
  if (!existsSync(path.join(workspace, 'index.html'))) {
    return {pass: false, reason: 'index.html was not written'};
  }
  const {chromium} = require('playwright');
  const {defineNetworkFixture} = await import(requireFromSample.resolve('@msw/playwright'));
  const server = await serve(workspace);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  let apiRequests = 0;
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text().slice(0, 300));
    }
  });
  page.on('pageerror', (error) => pageErrors.push(String(error.message).slice(0, 300)));
  page.on('request', (request) => {
    if (/\/rest\/(search|organizations)\//.test(request.url())) {
      apiRequests++;
    }
  });

  const network = defineNetworkFixture({context, handlers: await mockHandlers(api)});
  await network.enable();
  await context.route(/analytics|\/rest\/ua\/|coveo\.analytics/, (route) => route.abort());

  let counts = {items: 0, errors: 0, errorMessages: [], interfaces: 0, atomicLoaded: false};
  try {
    const {port} = server.address();
    await page.goto(`http://127.0.0.1:${port}/`, {waitUntil: 'domcontentloaded'});
    const deadline = Date.now() + RENDER_TIMEOUT_MS;
    while (Date.now() < deadline) {
      counts = await page.evaluate(inspectPage);
      if (counts.items > 0 || counts.errors > 0) {
        break;
      }
      await page.waitForTimeout(500);
    }
  } catch (error) {
    pageErrors.push(`navigation: ${String(error.message).slice(0, 300)}`);
  } finally {
    await network.disable();
    await browser.close();
    server.close();
  }

  const pass = counts.items > 0 && counts.errors === 0 && pageErrors.length === 0;
  const reason = pass
    ? ''
    : counts.errors > 0
      ? `component error: ${counts.errorMessages[0] ?? ''}`
      : pageErrors.length > 0
        ? `page error: ${pageErrors[0]}`
        : !counts.atomicLoaded
          ? 'Atomic never loaded'
          : apiRequests === 0
            ? 'no query was sent'
            : 'no item rendered';
  return {pass, reason, ...counts, apiRequests, consoleErrors, pageErrors};
}
