import {test as base} from '@playwright/test';
import {RecsInterfacePageObject as RecsInterface} from './page-object';

type MyFixtures = {
  recsInterface: RecsInterface;
};

export const test = base.extend<MyFixtures>({
  recsInterface: async ({page}, use) => {
    await use(new RecsInterface(page));
  },
});

export {expect} from '@playwright/test';
