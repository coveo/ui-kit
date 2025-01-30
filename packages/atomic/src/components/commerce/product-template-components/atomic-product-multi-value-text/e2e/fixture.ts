import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {ProductMultiValueTextPageObject} from './page-object';

type MyFixtures = {
  productMultiValueText: ProductMultiValueTextPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productMultiValueText: async ({page}, use) => {
    await use(new ProductMultiValueTextPageObject(page));
  },
});

export {expect} from '@playwright/test';
