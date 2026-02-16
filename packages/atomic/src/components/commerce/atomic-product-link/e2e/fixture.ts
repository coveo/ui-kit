import {test as base} from '@playwright/test';
import {ProductLinkPageObject} from './page-object';

type MyFixtures = {
  productLink: ProductLinkPageObject;
};

export const test = base.extend<MyFixtures>({
  productLink: async ({page}, use) => {
    await use(new ProductLinkPageObject(page));
  },
});

export {expect} from '@playwright/test';
