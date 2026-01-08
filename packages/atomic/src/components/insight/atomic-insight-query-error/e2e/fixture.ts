import {test as base} from '@playwright/test';
import {InsightQueryErrorPageObject} from './page-object';

type MyFixtures = {
  insightQueryError: InsightQueryErrorPageObject;
};

export const test = base.extend<MyFixtures>({
  insightQueryError: async ({page}, use) => {
    await use(new InsightQueryErrorPageObject(page));
  },
});

export {expect} from '@playwright/test';
