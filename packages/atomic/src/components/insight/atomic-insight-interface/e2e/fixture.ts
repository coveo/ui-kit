import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {InsightInterfacePageObject} from './page-object';

type AtomicInsightInterfaceE2EFixtures = {
  insightInterface: InsightInterfacePageObject;
};

export const test = base.extend<AtomicInsightInterfaceE2EFixtures & AxeFixture>(
  {
    makeAxeBuilder,
    insightInterface: async ({page}, use) => {
      await use(new InsightInterfacePageObject(page));
    },
  }
);

export {expect} from '@playwright/test';
