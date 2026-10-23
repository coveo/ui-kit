import path from 'node:path';
import {expect, test as base} from '@chromatic-com/playwright';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {MockSearchApi, MockCommerceApi, MockInsightApi} from '@coveo/platform-mock-api';
import type {HttpHandler} from 'msw';

const COMMIT_SHA = process.env.COMMIT_SHA;
const BASE_URL = COMMIT_SHA
  ? `https://static.cloud.coveo.com/atomic/commits/${COMMIT_SHA}`
  : 'https://static.cloud.coveo.com/atomic/v3';
const ATOMIC_URL = `${BASE_URL}/atomic.esm.js`;
const THEME_URL = `${BASE_URL}/themes/coveo.css`;

export const searchApi = new MockSearchApi();
export const commerceApi = new MockCommerceApi();
export const insightApi = new MockInsightApi();

interface RenderPageOptions {
  page: string;
  handlers: HttpHandler[];
  interfaceTag: string;
  initializeOptions: Record<string, unknown>;
  firstRequest: 'executeFirstSearch' | 'executeFirstRequest';
  itemSelector: string;
}

interface Fixtures {
  network: NetworkFixture;
  renderPage: (options: RenderPageOptions) => Promise<void>;
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
  renderPage: async ({page, network}, use) => {
    await use(async (options) => {
      network.use(...options.handlers);

      const filePath = path.resolve(import.meta.dirname, 'pages', options.page);
      await page.goto(`file://${filePath}`);
      await page.addStyleTag({url: THEME_URL});
      await page.addScriptTag({url: ATOMIC_URL, type: 'module'});

      await page.waitForFunction((tag) => customElements.get(tag), options.interfaceTag);
      const atomicInterface = page.locator(options.interfaceTag);
      await atomicInterface.evaluate(
        (el: any, initializeOptions) => el.initialize(initializeOptions),
        options.initializeOptions
      );
      await atomicInterface.evaluate((el: any, method) => el[method](), options.firstRequest);

      // The snapshot is taken when the test ends, so wait until nothing is still loading.
      await expect(page.locator(options.itemSelector).first()).toBeVisible();
      await expect(atomicInterface.locator('atomic-result-placeholder')).toHaveCount(0);
      await expect(atomicInterface.locator(':not(:defined)')).toHaveCount(0);
    });
  },
});
