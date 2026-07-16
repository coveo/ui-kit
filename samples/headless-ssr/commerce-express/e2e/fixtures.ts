import {MockCommerceApi} from '@coveo/platform-mock-api';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {test as base, expect} from '@playwright/test';

interface Fixtures {
  network: NetworkFixture;
}

const commerceApi = new MockCommerceApi();

/**
 * Extends the Playwright test with an MSW network fixture that mocks the Coveo
 * Commerce API in the browser (client-side hydration and interactions). The
 * server-side calls are mocked separately by the preloaded MSW server (see
 * `mocks/register.ts`), so both the initial SSR render and subsequent client
 * requests are deterministic.
 */
export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...commerceApi.handlers],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
});

export {expect};
