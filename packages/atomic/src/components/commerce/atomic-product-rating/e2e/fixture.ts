import {test as base} from '@playwright/test';
import {ProductRatingPageObject} from './page-object';

type MyFixtures = {
  productRating: ProductRatingPageObject;
};

export const test = base.extend<MyFixtures>({
  productRating: async ({page}, use) => {
    await use(new ProductRatingPageObject(page));
  },
});

export {expect} from '@playwright/test';
