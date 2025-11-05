import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {LoadMoreResultsPageObject as LoadMore} from './page-object';

type MyFixtures = {
  loadMore: LoadMore;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  loadMore: async ({page}, use) => {
    await use(new LoadMore(page));
  },
});
export {expect} from '@playwright/test';
