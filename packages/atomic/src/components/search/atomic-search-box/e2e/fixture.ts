import {test as base} from '@playwright/test';
import {SearchBoxPageObject} from './page-object';

type AtomicSearchBoxE2EFixtures = {
  searchBox: SearchBoxPageObject;
};

export const test = base.extend<AtomicSearchBoxE2EFixtures>({
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});

export {expect} from '@playwright/test';
