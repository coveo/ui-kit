import {test as base} from '@playwright/test';
import {SmartSnippetSuggestionsPageObject} from './page-object';

type MyFixtures = {
  smartSnippetSuggestions: SmartSnippetSuggestionsPageObject;
};

export const test = base.extend<MyFixtures>({
  smartSnippetSuggestions: async ({page}, use) => {
    await use(new SmartSnippetSuggestionsPageObject(page));
  },
});

export {expect} from '@playwright/test';
