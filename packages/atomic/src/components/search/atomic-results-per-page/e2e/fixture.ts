import {test as base} from '@playwright/test';
import {AtomicResultsPerPagePageObject} from './page-object';

type Fixtures = {
  resultsPerPage: AtomicResultsPerPagePageObject;
};

export const test = base.extend<Fixtures>({
  resultsPerPage: async ({page}, use) => {
    await use(new AtomicResultsPerPagePageObject(page));
  },
});

export {expect} from '@playwright/test';
