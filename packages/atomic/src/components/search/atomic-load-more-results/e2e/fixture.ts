import {test as base} from '@playwright/test';
import {LoadMoreResultsPageObject as LoadMore} from './page-object';

type MyFixtures = {
  loadMore: LoadMore;
};

export const test = base.extend<MyFixtures>({
  loadMore: async ({page}, use) => {
    await use(new LoadMore(page));
  },
});
export {expect} from '@playwright/test';
