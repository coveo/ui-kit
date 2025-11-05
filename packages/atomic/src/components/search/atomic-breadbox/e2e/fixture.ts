import {test as base} from '@playwright/test';
import {AtomicCommerceBreadboxPageObject} from './page-object';

type MyFixtures = {
  breadbox: AtomicCommerceBreadboxPageObject;
};

export const test = base.extend<MyFixtures>({
  breadbox: async ({page}, use) => {
    await use(new AtomicCommerceBreadboxPageObject(page));
  },
});
export {expect} from '@playwright/test';
