import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCommerceDidYouMeanPageObject} from './page-object';

type Fixtures = {
  commerceDidYouMean: AtomicCommerceDidYouMeanPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceDidYouMean: async ({page}, use) => {
    await use(new AtomicCommerceDidYouMeanPageObject(page));
  },
});

export {expect} from '@playwright/test';
