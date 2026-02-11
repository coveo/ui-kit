import {test as base} from '@playwright/test';
import {InsightFoldedResultListPageObject} from './page-object';

interface TestFixture {
  foldedResultList: InsightFoldedResultListPageObject;
}

export const test = base.extend<TestFixture>({
  foldedResultList: async ({page}, use) => {
    await use(new InsightFoldedResultListPageObject(page));
  },
});

export {expect} from '@playwright/test';
