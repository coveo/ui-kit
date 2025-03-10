import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicCommerceProductListPageObject} from './page-object';

type Fixtures = {
  commerceProductList: AtomicCommerceProductListPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceProductList: async ({page}, use) => {
    await use(new AtomicCommerceProductListPageObject(page));
  },
});

export {expect} from '@playwright/test';
