import {test as base} from '@playwright/test';
import {CartPageObject as Cart} from '../page-objects/cart.page';
import {HydratedPageObject as Hydrated} from '../page-objects/hydrated.page';
import {RecommendationsPageObject as Recommendations} from '../page-objects/recommendations.page';

type MyFixtures = {
  cart: Cart;
  hydrated: Hydrated;
  recommendations: Recommendations;
};

export const test = base.extend<MyFixtures>({
  cart: async ({page}, use) => {
    await use(new Cart(page));
  },
  hydrated: async ({page}, use) => {
    await use(new Hydrated(page));
  },
  recommendations: async ({page}, use) => {
    await use(new Recommendations(page));
  },
});
export {expect} from '@playwright/test';
