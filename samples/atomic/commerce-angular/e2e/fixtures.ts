import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {MockCommerceApi} from '@coveo/platform-mock-api';
import {test as base, expect} from '@playwright/test';

interface Fixtures {
  network: NetworkFixture;
}

const commerceApi = new MockCommerceApi();

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
