import {test as base} from '@playwright/test';
import {AtomicCommerceRecommendationListPageObject} from './page-object';

type MyFixtures = {
  recommendationList: AtomicCommerceRecommendationListPageObject;
};

export const test = base.extend<MyFixtures>({
  recommendationList: async ({page}, use) => {
    await use(new AtomicCommerceRecommendationListPageObject(page));
  },
});

export {expect} from '@playwright/test';
