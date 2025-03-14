import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicLoadMoreItemsPageObject} from './page-object';

type Fixtures = {
  loadMoreItems: AtomicLoadMoreItemsPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  loadMoreItems: async ({page}, use) => {
    await use(new AtomicLoadMoreItemsPageObject(page));
  },
});

export {expect} from '@playwright/test';
