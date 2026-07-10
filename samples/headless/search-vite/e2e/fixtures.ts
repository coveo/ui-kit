import {test as base, expect} from '@playwright/test';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {MockSearchApi} from '@coveo/platform-mock-api';

interface Fixtures {
  network: NetworkFixture;
}

const searchApi = new MockSearchApi();

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...searchApi.handlers],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
});

export {expect};
