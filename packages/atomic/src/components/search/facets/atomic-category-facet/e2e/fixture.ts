import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCategoryFacetPageObject as Facet} from './page-object';

type MyFixture = {
  facet: Facet;
};

export const test = base.extend<MyFixture & AxeFixture>({
  makeAxeBuilder,
  facet: async ({page}, use) => {
    await use(new Facet(page));
  },
});

export {expect} from '@playwright/test';
