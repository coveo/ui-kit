import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {NumericFacetPageObject} from './page-object';

type MyFixtures = {
  numericFacet: NumericFacetPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  numericFacet: async ({page}, use) => {
    await use(new NumericFacetPageObject(page));
  },
});

export {expect} from '@playwright/test';
