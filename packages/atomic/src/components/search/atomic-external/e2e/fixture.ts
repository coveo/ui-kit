import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicExternalPageObject as External} from './page-object';

type MyFixtures = {
  external: External;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  external: async ({page}, use) => {
    await use(new External(page));
  },
});

export {expect} from '@playwright/test';
