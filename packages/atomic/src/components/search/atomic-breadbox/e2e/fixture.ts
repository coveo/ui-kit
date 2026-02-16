import {test as base} from '@playwright/test';
import {AtomicBreadboxPageObject} from './page-object';

type MyFixtures = {
  breadbox: AtomicBreadboxPageObject;
};

export const test = base.extend<MyFixtures>({
  breadbox: async ({page}, use) => {
    await use(new AtomicBreadboxPageObject(page));
  },
});
export {expect} from '@playwright/test';
