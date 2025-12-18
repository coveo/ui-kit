import {test as base} from '@playwright/test';
import {RefineTogglePageObject} from './page-object';

type MyFixtures = {
  refineToggle: RefineTogglePageObject;
};

export const test = base.extend<MyFixtures>({
  refineToggle: async ({page}, use) => {
    await use(new RefineTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
