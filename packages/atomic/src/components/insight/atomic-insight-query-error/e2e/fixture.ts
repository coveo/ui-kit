import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightQueryErrorPageObject} from './page-object';

type Fixtures = {
  insightQueryError: AtomicInsightQueryErrorPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightQueryError: async ({page}, use) => {
    await use(new AtomicInsightQueryErrorPageObject(page));
  },
});

export {expect} from '@playwright/test';
