import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicInsightRefineModalPageObject} from './page-object';

type Fixtures = {
  insightRefineModal: AtomicInsightRefineModalPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  insightRefineModal: async ({page}, use) => {
    await use(new AtomicInsightRefineModalPageObject(page));
  },
});

export {expect} from '@playwright/test';
