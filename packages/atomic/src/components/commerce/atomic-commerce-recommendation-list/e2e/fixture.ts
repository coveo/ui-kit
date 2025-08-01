import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicCommerceRecommendationListPageObject} from './page-object';

type MyFixtures = {
  recommendationList: AtomicCommerceRecommendationListPageObject;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  recommendationList: async ({page}, use) => {
    await use(new AtomicCommerceRecommendationListPageObject(page));
  },
});

export {expect} from '@playwright/test';
