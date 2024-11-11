import {test as base} from '@playwright/test';
import {FacetPageObject as Facet} from '../page-objects/facet.page';
import {SearchPageObject as Search} from '../page-objects/search.page';

type MyFixtures = {
  facet: Facet;
  search: Search;
};

export const test = base.extend<MyFixtures>({
  facet: async ({page}, use) => {
    await use(new Facet(page));
  },
  search: async ({page}, use) => {
    await use(new Search(page));
  },
});
export {expect} from '@playwright/test';
