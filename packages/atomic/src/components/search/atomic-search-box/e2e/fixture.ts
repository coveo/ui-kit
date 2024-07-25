import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {SearchBoxPageObject} from './page-object';

type AtomicSearchBoxE2EFixtures = {
  searchBox: SearchBoxPageObject;
};

export const test = base.extend<AtomicSearchBoxE2EFixtures & AxeFixture>({
  makeAxeBuilder,
  searchBox: async ({page}, use) => {
    await use(new SearchBoxPageObject(page));
  },
});

export {expect} from '@playwright/test';
