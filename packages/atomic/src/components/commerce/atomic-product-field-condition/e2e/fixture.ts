import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicProductFieldConditionPageObject} from './page-object';

type Fixtures = {
  productFieldCondition: AtomicProductFieldConditionPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  productFieldCondition: async ({page}, use) => {
    await use(new AtomicProductFieldConditionPageObject(page));
  },
});

export {expect} from '@playwright/test';
