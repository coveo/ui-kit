import {test as base} from '@playwright/test';
import {RatingRangeFacetPageObject} from './page-object';

type MyFixtures = {
  ratingRangeFacet: RatingRangeFacetPageObject;
};

export const test = base.extend<MyFixtures>({
  ratingRangeFacet: async ({page}, use) => {
    await use(new RatingRangeFacetPageObject(page));
  },
});
export {expect} from '@playwright/test';
