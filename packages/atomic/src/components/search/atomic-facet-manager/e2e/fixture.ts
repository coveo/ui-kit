import {test as base} from '@playwright/test';
import {FacetManagerPageObject} from './page-object';

type MyFixtures = {
  component: FacetManagerPageObject;
};

export const test = base.extend<MyFixtures>({
  component: async ({page}, use) => {
    await use(new FacetManagerPageObject(page));
  },
});

export {expect} from '@playwright/test';
