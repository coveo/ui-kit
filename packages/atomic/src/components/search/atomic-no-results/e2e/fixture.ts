import {test as base} from '@playwright/test';
import {SearchBoxPageObject as SearchBox} from '../../atomic-search-box/e2e/page-object';
import {NoResultsPageObject as NoResults} from './page-object';

type MyFixtures = {
  searchBox: SearchBox;
  noResults: NoResults;
};

export const test = base.extend<MyFixtures>({
  searchBox: async ({page}, use) => {
    await use(new SearchBox(page));
  },
  noResults: async ({page}, use) => {
    await use(new NoResults(page));
  },
});
export {expect} from '@playwright/test';
