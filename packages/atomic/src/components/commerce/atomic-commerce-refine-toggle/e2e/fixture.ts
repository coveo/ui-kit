import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCommerceRefineTogglePageObject} from './page-object';

type Fixtures = {
  commerceRefineToggle: AtomicCommerceRefineTogglePageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceRefineToggle: async ({page}, use) => {
    await use(new AtomicCommerceRefineTogglePageObject(page));
  },
});

export {expect} from '@playwright/test';
