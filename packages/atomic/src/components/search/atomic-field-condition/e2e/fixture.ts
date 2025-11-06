import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicFieldConditionPageObject} from './page-object.js';

type Fixtures = {
  fieldCondition: AtomicFieldConditionPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  fieldCondition: async ({page}, use) => {
    await use(new AtomicFieldConditionPageObject(page));
  },
});

export {expect} from '@playwright/test';
