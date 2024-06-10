import {
  AxeFixture,
  makeAxeBuilder,
} from '@coveo/atomic/playwrightUtils/base-fixture';
import {test as base} from '@playwright/test';
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
