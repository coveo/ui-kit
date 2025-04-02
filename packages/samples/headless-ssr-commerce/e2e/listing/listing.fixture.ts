import {test as base} from '@playwright/test';
import {FacetPageObject as Facet} from '../page-objects/facet.page';
import {HydratedPageObject as Hydrated} from '../page-objects/hydrated.page';
import {SearchPageObject as Search} from '../page-objects/search.page';
import {SortPageObject as Sort} from '../page-objects/sort.page';

type MyFixtures = {
  search: Search;
  sort: Sort;
  facet: Facet;
  hydrated: Hydrated;
};

export const test = base.extend<MyFixtures>({
  search: async ({page}, use) => {
    await use(new Search(page));
  },
  sort: async ({page}, use) => {
    await use(new Sort(page));
  },
  facet: async ({page}, use) => {
    await use(new Facet(page));
  },
  hydrated: async ({page}, use) => {
    await use(new Hydrated(page));
  },
});
export {expect} from '@playwright/test';
