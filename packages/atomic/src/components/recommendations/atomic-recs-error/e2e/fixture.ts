import {test as base} from '@playwright/test';
import {RecsErrorPageObject} from './page-object';

type MyFixtures = {
  recsError: RecsErrorPageObject;
};

export const test = base.extend<MyFixtures>({
  recsError: async ({page}, use) => {
    await use(new RecsErrorPageObject(page));
  },
});

export {expect} from '@playwright/test';
