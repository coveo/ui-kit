import {AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {test as base} from '@playwright/test';
import {AtomicBlaPageObject} from './page-object';

type Fixtures = {
  bla: AtomicBlaPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  bla: async ({page}, use) => {
    await use(new AtomicBlaPageObject(page));
  },
});

export {expect} from '@playwright/test';
