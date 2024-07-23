import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {AtomicCommercePagerLocators as Pager} from './page-object';

type MyFixtures = {
  pager: Pager;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  pager: async ({page}, use) => {
    await use(new Pager(page));
  },
});
export {expect} from '@playwright/test';
