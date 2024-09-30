import {test as base} from '@playwright/test';
import {
  AxeFixture,
  makeAxeBuilder,
} from '../../../../../playwright-utils/base-fixture';
import {AtomicCommerceRecommendationList as RecommendationList} from './page-object';

type MyFixtures = {
  recommendationList: RecommendationList;
};

export const test = base.extend<MyFixtures & AxeFixture>({
  makeAxeBuilder,
  recommendationList: async ({page}, use) => {
    await use(new RecommendationList(page));
  },
});

export {expect} from '@playwright/test';
