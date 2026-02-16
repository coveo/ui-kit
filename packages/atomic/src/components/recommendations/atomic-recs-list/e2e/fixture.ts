import {test as base} from '@playwright/test';
import {AtomicRecsListPageObject} from './page-object';

type MyFixtures = {
  recsList: AtomicRecsListPageObject;
};

export const test = base.extend<MyFixtures>({
  recsList: async ({page}, use) => {
    await use(new AtomicRecsListPageObject(page));
  },
});

export {expect} from '@playwright/test';
