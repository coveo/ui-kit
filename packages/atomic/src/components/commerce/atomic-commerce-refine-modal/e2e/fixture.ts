import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCommerceRefineModalPageObject} from './page-object';

type Fixtures = {
  commerceRefineModal: AtomicCommerceRefineModalPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceRefineModal: async ({page}, use) => {
    await use(new AtomicCommerceRefineModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
