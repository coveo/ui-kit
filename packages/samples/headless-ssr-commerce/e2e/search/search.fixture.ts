import {test as base} from '@playwright/test';
import {FacetPageObject as Facet} from '../page-objects/facet.page';
import {HydratedPageObject as Hydrated} from '../page-objects/hydrated.page';
import {SearchPageObject as Search} from '../page-objects/search.page';

type MyFixtures = {
  facet: Facet;
  search: Search;
  hydrated: Hydrated;
};

export const test = base.extend<MyFixtures>({
  facet: async ({page}, use) => {
    await use(new Facet(page));
  },
  search: async ({page}, use) => {
    await use(new Search(page));
  },
  hydrated: async ({page}, use) => {
    await use(new Hydrated(page));
  },
});
export {expect} from '@playwright/test';
