import {test as base} from '@playwright/test';
import {HydratedPageObject as Hydrated} from '../page-objects/hydrated.page';
import {RecommendationsPageObject as Recommendations} from '../page-objects/recommendations.page';
import {SearchPageObject as Search} from '../page-objects/search.page';
import {SortPageObject as Sort} from '../page-objects/sort.page';

type MyFixtures = {
  search: Search;
  sort: Sort;
  hydrated: Hydrated;
  recommendations: Recommendations;
};

export const test = base.extend<MyFixtures>({
  search: async ({page}, use) => {
    await use(new Search(page));
  },
  sort: async ({page}, use) => {
    await use(new Sort(page));
  },
  hydrated: async ({page}, use) => {
    await use(new Hydrated(page));
  },
  recommendations: async ({page}, use) => {
    await use(new Recommendations(page));
  },
});
export {expect} from '@playwright/test';
