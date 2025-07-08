import {makeAxeBuilder, AxeFixture} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {ProductExcerptPageObject as ProductExcerpt} from './page-object';

type MyFixtures = {
  productExcerpt: ProductExcerpt;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productExcerpt: async ({page}, use) => {
    await use(new ProductExcerpt(page));
  },
});

export {expect} from '@playwright/test';
