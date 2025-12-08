import {test as base} from '@playwright/test';
import {PopoverPageObject} from './page-object';

type MyFixtures = {
  popover: PopoverPageObject;
};

export const test = base.extend<MyFixtures>({
  popover: async ({page}, use) => {
    await use(new PopoverPageObject(page));
  },
});
export {expect} from '@playwright/test';
