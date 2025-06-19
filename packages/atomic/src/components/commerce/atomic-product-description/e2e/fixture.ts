import {makeAxeBuilder, AxeFixture} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
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
