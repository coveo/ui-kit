import {EndpointHarness, MockCommerceApi} from '@coveo/platform-mock-api';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {test as base, expect} from '@playwright/test';
import {HttpResponse, http} from 'msw';

interface Fixtures {
  network: NetworkFixture;
}

const commerceApi = new MockCommerceApi();

// The shared mock does not cover badges. The public sample organization has no
// badge configured for the placement the product page requests, so a badge is
// mocked here to prove the Headless badges element renders what it receives.
const badgesEndpoint = new EndpointHarness(
  'POST',
  'https://:orgId.org.coveo.com/rest/organizations/:orgId/commerce/v2/tracking-ids/:trackingId/badges',
  {
    products: [
      {
        productId: 'mocked',
        badgePlacements: [
          {
            placementId: '70b493b2-a1f1-4049-ad70-16695cef39cd',
            badges: [
              {
                text: 'Best seller',
                backgroundColor: '#1372ec',
                textColor: '#ffffff',
                iconUrl: null,
              },
            ],
          },
        ],
      },
    ],
  }
);

// Analytics events are acknowledged without leaving the test run. Tests assert on
// them with `page.waitForRequest`.
const analyticsHandler = http.post(
  'https://:orgId.analytics.org.coveo.com/rest/organizations/:orgId/events/v1',
  () => new HttpResponse(null, {status: 202})
);

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...commerceApi.handlers, badgesEndpoint.generateHandler(), analyticsHandler],
      });
      await network.enable();
      await use(network);
      await network.disable();
    },
    {auto: true},
  ],
});

export const cartStorageKey = 'coveo-hybrid-sample-cart';

export {expect};
