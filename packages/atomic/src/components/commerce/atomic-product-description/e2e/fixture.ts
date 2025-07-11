import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {ProductDescriptionPageObject as ProductDescription} from './page-object';

type MyFixtures = {
  productDescription: ProductDescription;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productDescription: async ({page}, use) => {
    await use(new ProductDescription(page));
  },
});

export {expect} from '@playwright/test';
