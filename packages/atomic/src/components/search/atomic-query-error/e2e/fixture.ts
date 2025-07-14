import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {QueryErrorPageObject} from './page-object';

type MyFixtures = {
  queryError: QueryErrorPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  queryError: async ({page}, use) => {
    await use(new QueryErrorPageObject(page));
  },
});

export {expect} from '@playwright/test';
