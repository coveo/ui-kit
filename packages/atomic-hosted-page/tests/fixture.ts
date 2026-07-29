import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {test as base} from '@playwright/test';
import {hostedPageHandlers} from './mocks/hosted-page-api.js';
import {searchHandlers} from './mocks/search-api.js';

interface Fixtures {
  network: NetworkFixture;
}

const platformHost = /\.org\.coveo\.com$/;

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...hostedPageHandlers, ...searchHandlers],
        onUnhandledRequest: ({url}, print) => {
          if (platformHost.test(new URL(url).hostname)) {
            print.error();
          }
        },
      });

      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
});

export {expect} from '@playwright/test';
