import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicResultNumberPageObject} from './page-object';

type Fixtures = {
  resultNumber: AtomicResultNumberPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  resultNumber: async ({page}, use) => {
    await use(new AtomicResultNumberPageObject(page));
  },
});

export {expect} from '@playwright/test';
