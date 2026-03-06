import {test as base} from '@playwright/test';
import {AtomicInsightFacetPageObject as InsightFacet} from './page-object';

type MyFixture = {
  insightFacet: InsightFacet;
};

export const test = base.extend<MyFixture>({
  insightFacet: async ({page}, use) => {
    await use(new InsightFacet(page));
  },
});

export {expect} from '@playwright/test';
