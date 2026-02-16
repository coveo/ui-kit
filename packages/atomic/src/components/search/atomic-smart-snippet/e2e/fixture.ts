import {test as base} from '@playwright/test';
import {SmartSnippetPageObject} from './page-object';

type MyFixtures = {
  smartSnippet: SmartSnippetPageObject;
};

export const test = base.extend<MyFixtures>({
  smartSnippet: async ({page}, use) => {
    await use(new SmartSnippetPageObject(page));
  },
});

export {expect} from '@playwright/test';
