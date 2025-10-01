import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicSearchBoxInstantResultsPageObject} from './page-object';

type Fixtures = {
  searchBoxInstantResults: AtomicSearchBoxInstantResultsPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  searchBoxInstantResults: async ({page}, use) => {
    await use(new AtomicSearchBoxInstantResultsPageObject(page));
  },
});

export {expect} from '@playwright/test';
