import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {ProductTemplateObject} from './page-object';

interface TestFixture {
  productTemplate: ProductTemplateObject;
}
export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  productTemplate: async ({page}, use) => {
    await use(new ProductTemplateObject(page));
  },
});
export {expect} from '@playwright/test';
