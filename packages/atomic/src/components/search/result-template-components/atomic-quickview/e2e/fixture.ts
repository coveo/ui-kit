import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicQuickviewLocators as Quickview} from './page-object';

type MyFixtures = {
  quickview: Quickview;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  quickview: async ({page}, use) => {
    await use(new Quickview(page));
  },
});
export {expect} from '@playwright/test';
