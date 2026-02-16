import {test as base} from '@playwright/test';
import {CartPageObject as Cart} from '../page-objects/cart.page';
import {HydratedPageObject as Hydrated} from '../page-objects/hydrated.page';

type MyFixtures = {
  cart: Cart;
  hydrated: Hydrated;
};

export const test = base.extend<MyFixtures>({
  cart: async ({page}, use) => {
    await use(new Cart(page));
  },
  hydrated: async ({page}, use) => {
    await use(new Hydrated(page));
  },
});
export {expect} from '@playwright/test';
