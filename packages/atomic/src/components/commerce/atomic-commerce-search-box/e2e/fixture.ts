import {
  AxeFixture,
  makeAxeBuilder,
} from '@coveo/atomic/playwrightUtils/base-fixture';
import {Page, test as base} from '@playwright/test';
import {AtomicCommerceLoadMoreProductsLocators as LoadMore} from '../../atomic-commerce-load-more-products/e2e/page-object';
import {AtomicCommerceFacetsLocators as Facets} from '../../facets/atomic-commerce-facets/e2e/page-object';
import {AtomicCommerceSearchBoxLocators as SearchBox} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  facets: Facets;
  loadMore: LoadMore;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  facets: async ({page}, use) => {
    await use(new Facets(page));
  },
  loadMore: async ({page}, use) => {
    await use(new LoadMore(page));
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
