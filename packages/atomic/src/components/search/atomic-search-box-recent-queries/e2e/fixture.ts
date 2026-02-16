import {test as base, type Page} from '@playwright/test';
import {AtomicSearchBoxRecentQueriesPageObject} from './page-object.js';

type Fixtures = {
  searchBoxRecentQueries: AtomicSearchBoxRecentQueriesPageObject;
};

export async function setRecentQueries(page: Page, queries: string[]) {
  await page.evaluate((queries: string[]) => {
    const stringified = JSON.stringify(queries);
    localStorage.setItem('coveo-recent-queries', stringified);
  }, queries);
}

export const test = base.extend<Fixtures>({
  searchBoxRecentQueries: async ({page}, use) => {
    await use(new AtomicSearchBoxRecentQueriesPageObject(page));
  },
});

export {expect} from '@playwright/test';
