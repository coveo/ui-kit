import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {SearchBoxPageObject} from '../../atomic-search-box/e2e/page-object';
import {AtomicSearchBoxInstantResultsPageObject} from './page-object';

type Fixtures = {
  searchBoxInstantResults: AtomicSearchBoxInstantResultsPageObject;
  searchBox: SearchBoxPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  searchBoxInstantResults: async ({page}, use) => {
    await use(new AtomicSearchBoxInstantResultsPageObject(page));
  },
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});

export {expect} from '@playwright/test';
