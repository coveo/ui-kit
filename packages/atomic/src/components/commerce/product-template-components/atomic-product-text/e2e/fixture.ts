import {makeAxeBuilder, AxeFixture} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {ProductTextPageObject as ProductText} from './page-object';

type MyFixtures = {
  productText: ProductText;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productText: async ({page}, use) => {
    await use(new ProductText(page));
  },
});

export {expect} from '@playwright/test';
