import type {NetworkFixture} from '@msw/playwright';
import type {Page} from '@playwright/test';
import {
  expect,
  initializeCommerceInterface,
  initializeCommerceRecommendationInterface,
  initializeExternalInterface,
  initializeInsightInterface,
  initializeRecommendationInterface,
  initializeSearchInterface,
  test,
} from './fixture.js';

interface Scenario {
  name: string;
  url: string;
  initialize: (page: Page, network: NetworkFixture) => Promise<void>;
}

const scenarios: Scenario[] = [
  {
    name: 'search interface',
    url: '/search.html',
    initialize: (page) => initializeSearchInterface(page),
  },
  {
    name: 'commerce interface',
    url: '/commerce.html',
    initialize: (page) => initializeCommerceInterface(page),
  },
  {
    name: 'insight interface',
    url: '/insight.html',
    initialize: (page) => initializeInsightInterface(page),
  },
  {
    name: 'recommendations interface',
    url: '/recs.html',
    initialize: (page, network) => initializeRecommendationInterface(page, network),
  },
  {
    name: 'external components',
    url: '/external.html',
    initialize: (page) => initializeExternalInterface(page),
  },
  {
    name: 'commerce recommendations interface',
    url: '/commerce-recommendation.html',
    initialize: (page) => initializeCommerceRecommendationInterface(page),
  },
];

test.describe('style encapsulation', () => {
  for (const {name, url, initialize} of scenarios) {
    test(`Atomic styles stay inside the shadow DOM for the ${name}`, async ({page, network}) => {
      await page.goto(url);
      await initialize(page, network);

      const coveoTheme = page.locator(
        'link[rel="stylesheet"][href*="coveo.css"], style[data-vite-dev-id*="themes/coveo.css"]'
      );
      await expect(coveoTheme).toHaveCount(1);

      const sentinel = page.locator('.styles-error');
      await sentinel.waitFor({state: 'attached'});
      await expect(sentinel).not.toBeVisible();
    });
  }
});
