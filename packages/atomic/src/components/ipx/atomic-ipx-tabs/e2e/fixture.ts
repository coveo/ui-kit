import {test as base} from '@playwright/test';
import {IpxTabsPageObject} from './page-object';

type MyFixtures = {
  component: IpxTabsPageObject;
};

export const test = base.extend<MyFixtures>({
  component: async ({page}, use) => {
    await use(new IpxTabsPageObject(page));
  },
});

export {expect} from '@playwright/test';
