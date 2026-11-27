import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

const staticCdnDir = join(import.meta.dirname, 'dist/proda/StaticCDN');
const atomicEntryFiles = new Set(['atomic.esm.js', 'index.js', 'index.esm.js']);

const isCdnFile = (url) => /^\/(atomic|headless|bueno)\/v[\d.]+\//.test(url.pathname);

const isAtomicChunk = (url) => {
  const match = url.pathname.match(/^\/atomic\/v3\/([^/]+\.js)$/);
  return match !== null && !atomicEntryFiles.has(match[1]);
};

let atomicChunkDelayMs = 0;

// Vitest rewrites every `import()` of the modules it serves to go through its test runner, which only exists in the
// test's own frame. Pages that a test opens in an iframe get the files as the CDN serves them instead.
const serveCdnFile = async (route) => {
  const url = new URL(route.request().url());
  const file = join(staticCdnDir, decodeURIComponent(url.pathname));
  if (!existsSync(file)) {
    await route.fallback();
    return;
  }
  if (isAtomicChunk(url)) {
    await sleep(atomicChunkDelayMs);
  }
  await route.fulfill({path: file});
};

export default defineConfig({
  name: 'cdn-check',

  test: {
    includeSource: [
      './dist/proda/StaticCDN/**/*',
      '!./dist/proda/StaticCDN/atomic/*/storybook/**/*',
    ],
    root: './dist/proda/StaticCDN',
    include: ['../../../tests/**/*.spec.ts'],
    name: 'cdn-check',
    browser: {
      provider: playwright(),
      enabled: true,
      commands: {
        async serveCdnAsIs({page}, delayAtomicChunksMs) {
          atomicChunkDelayMs = delayAtomicChunksMs;
          await page.route(isCdnFile, serveCdnFile);
        },
        async stopServingCdnAsIs({page}) {
          await page.unroute(isCdnFile, serveCdnFile);
        },
      },
      instances: [
        {
          browser: 'chromium',
          headless: true,
          context: {
            actionTimeout: 3000,
          },
        },
      ],
    },
  },
});
