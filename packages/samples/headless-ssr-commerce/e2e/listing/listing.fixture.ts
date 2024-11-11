import {test as base} from '@playwright/test';
import {CartPageObject as Cart} from '../page-objects/cart.page';
import {FacetPageObject as Facet} from '../page-objects/facet.page';
import {SearchPageObject as Search} from '../page-objects/search.page';

type MyFixtures = {
  cart: Cart;
  facet: Facet;
  search: Search;
};

export const test = base.extend<MyFixtures>({
  cart: async ({page}, use) => {
    await use(new Cart(page));
  },
  search: async ({page}, use) => {
    await use(new Search(page));
  },
  facet: async ({page}, use) => {
    await use(new Facet(page));
  },
});
export {expect} from '@playwright/test';
