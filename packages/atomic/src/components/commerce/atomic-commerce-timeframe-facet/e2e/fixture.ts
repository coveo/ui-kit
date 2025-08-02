import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCommerceTimeframeFacetPageObject} from './page-object';

type Fixtures = {
  commerceTimeframeFacet: AtomicCommerceTimeframeFacetPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  commerceTimeframeFacet: async ({page}, use) => {
    await use(new AtomicCommerceTimeframeFacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
