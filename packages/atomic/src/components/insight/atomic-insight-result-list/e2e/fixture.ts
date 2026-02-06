import {test as base} from '@playwright/test';
import {InsightResultListPageObject} from './page-object';

interface TestFixture {
  resultList: InsightResultListPageObject;
}

export const test = base.extend<TestFixture>({
  resultList: async ({page}, use) => {
    await use(new InsightResultListPageObject(page));
  },
});

export {expect} from '@playwright/test';
