import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {AtomicCommerceRecsListPageObject as RecsList} from './page-object';

type MyFixtures = {
  recsList: RecsList;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  recsList: async ({page}, use) => {
    await use(new RecsList(page));
  },
});

export {expect} from '@playwright/test';
