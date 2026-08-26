import {MockCommerceApi, MockInsightApi, MockSearchApi} from '@coveo/platform-mock-api';
import {MockRecommendationApi} from '@coveo/platform-mock-api/recommendation';
import {defineNetworkFixture, type NetworkFixture} from '@msw/playwright';
import {test as base, type Page} from '@playwright/test';

const searchApi = new MockSearchApi();
const commerceApi = new MockCommerceApi();
const insightApi = new MockInsightApi();
const recommendationApi = new MockRecommendationApi();

const platformHost = /\.org\.coveo\.com$/;

interface Fixtures {
  network: NetworkFixture;
}

export const test = base.extend<Fixtures>({
  network: [
    async ({context}, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...searchApi.handlers, ...commerceApi.handlers, ...insightApi.handlers],
        onUnhandledRequest: ({url}, print) => {
          if (platformHost.test(new URL(url).hostname)) {
            print.error();
          }
        },
      });

      await network.enable();
      await use(network);
      await network.disable();
      searchApi.clearAll();
      commerceApi.clearAll();
      insightApi.clearAll();
      recommendationApi.clearAll();
    },
    {auto: true},
  ],
});

const credentials = {
  accessToken: 'theming-e2e-token',
  organizationId: 'testorg',
};

async function whenInterfaceDefined(page: Page, tagName: string) {
  await page.waitForFunction((tag) => !!customElements.get(tag), tagName);
}

export async function initializeSearchInterface(page: Page) {
  await whenInterfaceDefined(page, 'atomic-search-interface');
  const searchInterface = page.locator('atomic-search-interface');
  await searchInterface.evaluate(
    (element: HTMLElement & {initialize: (options: unknown) => Promise<void>}, options) =>
      element.initialize(options),
    credentials
  );
  await searchInterface.evaluate((element: HTMLElement & {executeFirstSearch: () => void}) =>
    element.executeFirstSearch()
  );
}

export async function initializeCommerceInterface(page: Page) {
  await whenInterfaceDefined(page, 'atomic-commerce-interface');
  const commerceInterface = page.locator('atomic-commerce-interface');
  await commerceInterface.evaluate(
    (element: HTMLElement & {initialize: (options: unknown) => Promise<void>}, options) =>
      element.initialize(options),
    {
      ...credentials,
      analytics: {trackingId: 'atomic-theming-e2e'},
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {url: 'https://example.com'},
      },
    }
  );
  await commerceInterface.evaluate((element: HTMLElement & {executeFirstRequest: () => void}) =>
    element.executeFirstRequest()
  );
}

export async function initializeInsightInterface(page: Page) {
  await whenInterfaceDefined(page, 'atomic-insight-interface');
  const insightInterface = page.locator('atomic-insight-interface');
  await insightInterface.evaluate(
    (element: HTMLElement & {initialize: (options: unknown) => Promise<void>}, options) =>
      element.initialize(options),
    {...credentials, insightId: 'theming-e2e-insight-id'}
  );
  await insightInterface.evaluate((element: HTMLElement & {executeFirstSearch: () => void}) =>
    element.executeFirstSearch()
  );
}

/**
 * The recommendation mock serves the same `/rest/search/v2` path as the search mock,
 * so its handlers are added per test to take precedence over the shared ones.
 */
export async function initializeRecommendationInterface(page: Page, network: NetworkFixture) {
  network.use(...recommendationApi.handlers);

  await whenInterfaceDefined(page, 'atomic-recs-interface');
  const recsInterface = page.locator('atomic-recs-interface');
  await recsInterface.evaluate(
    (element: HTMLElement & {initialize: (options: unknown) => Promise<void>}, options) =>
      element.initialize(options),
    credentials
  );
  await recsInterface.evaluate((element: HTMLElement & {getRecommendations: () => void}) =>
    element.getRecommendations()
  );
}

/**
 * `atomic-external` proxies to a sibling interface, so initializing that interface is
 * what brings the external components to life.
 */
export async function initializeExternalInterface(page: Page) {
  await whenInterfaceDefined(page, 'atomic-external');
  await initializeSearchInterface(page);
}

/**
 * The commerce recommendation interface only accepts a prebuilt engine, so the fixture page
 * exposes a helper that builds one where Vite can resolve the Headless import.
 */
export async function initializeCommerceRecommendationInterface(page: Page) {
  await whenInterfaceDefined(page, 'atomic-commerce-recommendation-interface');
  await page.waitForFunction(
    () => 'initializeCommerceRecommendations' in (window as unknown as Record<string, unknown>)
  );
  await page.evaluate(
    (options) =>
      (
        window as unknown as {
          initializeCommerceRecommendations: (options: unknown) => Promise<void>;
        }
      ).initializeCommerceRecommendations(options),
    {
      ...credentials,
      analytics: {trackingId: 'atomic-theming-e2e'},
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {url: 'https://example.com'},
      },
    }
  );
}

export {expect} from '@playwright/test';
