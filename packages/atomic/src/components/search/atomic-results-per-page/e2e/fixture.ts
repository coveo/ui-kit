import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicResultsPerPagePageObject} from './page-object';

type Fixtures = {
  resultsPerPage: AtomicResultsPerPagePageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  resultsPerPage: async ({page}, use) => {
    await use(new AtomicResultsPerPagePageObject(page));
  },
});

export {expect} from '@playwright/test';
