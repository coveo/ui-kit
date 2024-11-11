import {test as base} from '@playwright/test';
import {SearchPageObject as Search} from '../page-objects/search.page';

type MyFixtures = {
  search: Search;
};

export const test = base.extend<MyFixtures>({
  search: async ({page}, use) => {
    await use(new Search(page));
  },
});
export {expect} from '@playwright/test';
