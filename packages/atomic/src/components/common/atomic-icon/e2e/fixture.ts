import {test as base} from '@playwright/test';
import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {IconPageObject} from './page-object';

type MyFixtures = {
  icon: IconPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  icon: async ({page}, use) => {
    await use(new IconPageObject(page));
  },
});

export {expect} from '@playwright/test';
