import path from 'node:path';
import {test as base, expect} from '@chromatic-com/playwright';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {
  MockSearchApi,
  MockCommerceApi,
  MockInsightApi,
} from '@coveo/platform-mock-api';
import type {HttpHandler} from 'msw';

const COMMIT_SHA = process.env.COMMIT_SHA;
// Commit builds are published under `atomic/commits/<sha>` (no version segment),
// while the rolling release lives under `atomic/v3`. The previous commit URL
// (`atomic/commit/<sha>/v3`) returned 403, causing addStyleTag/addScriptTag to fail.
const BASE_URL = COMMIT_SHA
  ? `https://static.cloud.coveo.com/atomic/commits/${COMMIT_SHA}`
  : 'https://static.cloud.coveo.com/atomic/v3';
const ATOMIC_URL = `${BASE_URL}/atomic.esm.js`;
const THEME_URL = `${BASE_URL}/themes/coveo.css`;

export {expect};

export const searchApi = new MockSearchApi();
export const commerceApi = new MockCommerceApi();
export const insightApi = new MockInsightApi();

interface Fixtures {
  network: NetworkFixture;
  useHandlers: (handlers: HttpHandler[]) => Promise<void>;
  openPage: (name: string) => Promise<void>;
}

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context: context as any,
        handlers: [],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
  useHandlers: async ({network}, use) => {
    await use(async (handlers: HttpHandler[]) => {
      network.use(...handlers);
    });
  },
  openPage: async ({page}, use) => {
    await use(async (name: string) => {
      const filePath = path.resolve(import.meta.dirname, 'pages', name);
      await page.goto(`file://${filePath}`);
      await page.addStyleTag({url: THEME_URL});
      await page.addScriptTag({url: ATOMIC_URL, type: 'module'});
    });
  },
});
