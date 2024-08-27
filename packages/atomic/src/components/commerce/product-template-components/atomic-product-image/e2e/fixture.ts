import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../../playwright-utils/base-fixture';
import {ProductImageObject} from './page-object';

interface TestFixture {
  productImage: ProductImageObject;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  productImage: async ({page}, use) => {
    await use(new ProductImageObject(page));
  },
});
export {expect} from '@playwright/test';
