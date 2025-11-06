import {test as base} from '@playwright/test';
import {FacetPageObject} from './page-object';

type MyFixtures = {
  facet: FacetPageObject;
};

export const test = base.extend<MyFixtures>({
  facet: async ({page}, use) => {
    await use(new FacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
