import {test as base} from '@playwright/test';
import {AtomicCommerceBreadboxPageObject as Breadbox} from './page-object';

type MyFixtures = {
  breadbox: Breadbox;
};

export const test = base.extend<MyFixtures>({
  breadbox: async ({page}, use) => {
    await use(new Breadbox(page));
  },
});
export {expect} from '@playwright/test';
