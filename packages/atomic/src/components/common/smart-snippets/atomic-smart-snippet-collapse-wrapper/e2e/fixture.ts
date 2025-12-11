import {test as base} from '@playwright/test';
import {SmartSnippetCollapseWrapperPageObject} from './page-object';

type MyFixtures = {
  collapseWrapper: SmartSnippetCollapseWrapperPageObject;
};

export const test = base.extend<MyFixtures>({
  collapseWrapper: async ({page}, use) => {
    await use(new SmartSnippetCollapseWrapperPageObject(page));
  },
});

export {expect} from '@playwright/test';
