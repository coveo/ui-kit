import {test as base} from '@playwright/test';
import {AtomicCommerceInterfacePageObject} from '../../atomic-commerce-interface/e2e/page-object';
import {SearchBoxPageObject} from '../../atomic-commerce-search-box/e2e/page-object';
import {ProductListObject} from './page-object';

interface TestFixture {
  productList: ProductListObject;
  commerceInterface: AtomicCommerceInterfacePageObject;
  searchBox: SearchBoxPageObject;
}

export const test = base.extend<TestFixture>({
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
  productList: async ({page}, use) => {
    await use(new ProductListObject(page));
  },
  commerceInterface: async ({page}, use) => {
    await use(new AtomicCommerceInterfacePageObject(page));
  },
});
export {expect} from '@playwright/test';
