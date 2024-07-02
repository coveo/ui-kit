import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {SearchBoxPageObject} from '../../atomic-commerce-search-box/e2e/page-object';
import {ProductListObject} from './page-object';

interface TestFixture {
  productList: ProductListObject;
  searchBox: SearchBoxPageObject;
}

export const test = base.extend<TestFixture & AxeFixture>({
  makeAxeBuilder,
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
  productList: async ({page}, use) => {
    await use(new ProductListObject(page));
  },
});
export {expect} from '@playwright/test';
