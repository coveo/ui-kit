import {Page, test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {SearchBoxPageObject} from '../../../commerce/atomic-commerce-search-box/e2e/page-object';

type AtomicSearchBoxE2EFixtures = {
  searchBox: SearchBoxPageObject;
};

export const test = base.extend<AtomicSearchBoxE2EFixtures & AxeFixture>({
  makeAxeBuilder,
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});

export async function setRecentQueries(page: Page, count: number) {
  await page.evaluate((count: number) => {
    const recentQueries = Array.from(
      {length: count},
      (_, i) => `Recent query ${i}`
    );
    const stringified = JSON.stringify(recentQueries);
    localStorage.setItem('coveo-recent-queries', stringified);
  }, count);
}

export {expect} from '@playwright/test';
