import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {QuerySummaryPageObject} from '../../atomic-commerce-query-summary/e2e/page-object';
import {ProductsPerPageObject} from './page-object';

type MyFixtures = {
  productsPerPage: ProductsPerPageObject;
  querySummary: QuerySummaryPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  productsPerPage: async ({page}, use) => {
    await use(new ProductsPerPageObject(page));
  },
  querySummary: async ({page}, use) => {
    await use(new QuerySummaryPageObject(page));
  },
});
export {expect} from '@playwright/test';
