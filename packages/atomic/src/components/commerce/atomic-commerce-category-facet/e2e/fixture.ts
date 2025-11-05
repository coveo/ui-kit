import {test as base} from '@playwright/test';
import {CategoryFacetPageObject} from './page-object';

type MyFixtures = {
  categoryFacet: CategoryFacetPageObject;
};

export const test = base.extend<MyFixtures>({
  categoryFacet: async ({page}, use) => {
    await use(new CategoryFacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
