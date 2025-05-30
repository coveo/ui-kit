import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicCommerceLayoutPageObject} from './page-object';

type Fixtures = {
  commerceLayout: AtomicCommerceLayoutPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceLayout: async ({page}, use) => {
    await use(new AtomicCommerceLayoutPageObject(page));
  },
});

export {expect} from '@playwright/test';
