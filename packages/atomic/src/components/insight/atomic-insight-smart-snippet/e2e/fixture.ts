import {test as base} from '@playwright/test';
import {InsightSmartSnippetPageObject} from './page-object';

type MyFixtures = {
  insightSmartSnippet: InsightSmartSnippetPageObject;
};

export const test = base.extend<MyFixtures>({
  insightSmartSnippet: async ({page}, use) => {
    await use(new InsightSmartSnippetPageObject(page));
  },
});

export {expect} from '@playwright/test';
