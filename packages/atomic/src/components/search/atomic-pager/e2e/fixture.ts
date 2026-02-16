import {test as base} from '@playwright/test';
import {PagerPageObject as Pager} from './page-object';

type MyFixtures = {
  pager: Pager;
};

export const test = base.extend<MyFixtures>({
  pager: async ({page}, use) => {
    await use(new Pager(page));
  },
});
export {expect} from '@playwright/test';
