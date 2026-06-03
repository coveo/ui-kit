import {test as base} from '@playwright/test';
import {NoResultsPageObject as NoResults} from './page-object';

type MyFixtures = {
  noResults: NoResults;
};

export const test = base.extend<MyFixtures>({
  noResults: async ({page}, use) => {
    await use(new NoResults(page));
  },
});
export {expect} from '@playwright/test';
