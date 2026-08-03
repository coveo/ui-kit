import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {MockHostedPageApi} from '@coveo/platform-mock-api/hostedpage';
import {MockSearchApi} from '@coveo/platform-mock-api/search';
import {test as base} from '@playwright/test';

const hostedPageApi = new MockHostedPageApi();
const searchApi = new MockSearchApi();

interface Fixtures {
  network: NetworkFixture;
}

const platformHost = /\.org\.coveo\.com$/;

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...hostedPageApi.handlers, ...searchApi.handlers],
        onUnhandledRequest: ({url}, print) => {
          if (platformHost.test(new URL(url).hostname)) {
            print.error();
          }
        },
      });

      await network.enable();
      await use(network);
      await network.disable();
      hostedPageApi.clearAll();
      searchApi.clearAll();
    },
    {auto: true},
  ],
});

export {expect} from '@playwright/test';
