import {test as base} from '@playwright/test';
import {CartPageObject as Cart} from '../page-objects/cart.page';

type MyFixtures = {
  cart: Cart;
};

export const test = base.extend<MyFixtures>({
  cart: async ({page}, use) => {
    await use(new Cart(page));
  },
});
export {expect} from '@playwright/test';
