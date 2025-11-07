import {test as base} from '@playwright/test';
import {ProductTemplateObject} from './page-object';

interface TestFixture {
  productTemplate: ProductTemplateObject;
}
export const test = base.extend<TestFixture>({
  productTemplate: async ({page}, use) => {
    await use(new ProductTemplateObject(page));
  },
});
export {expect} from '@playwright/test';
