import {test as base} from '@playwright/test';
import {AtomicCommerceRecsListPageObject as RecsList} from './page-object';

type MyFixtures = {
  recsList: RecsList;
};

export const test = base.extend<MyFixtures>({
  recsList: async ({page}, use) => {
    await use(new RecsList(page));
  },
});

export {expect} from '@playwright/test';
