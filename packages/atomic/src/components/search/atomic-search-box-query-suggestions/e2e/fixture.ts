import type {Page} from '@playwright/test';
import {test as base} from '@playwright/test';
import {AtomicSearchBoxQuerySuggestionsPageObject} from './page-object';

type Fixtures = {
  searchBoxQuerySuggestions: AtomicSearchBoxQuerySuggestionsPageObject;
};

export const test = base.extend<Fixtures>({
  searchBoxQuerySuggestions: async (
    {page}: {page: Page},
    use: (r: AtomicSearchBoxQuerySuggestionsPageObject) => Promise<void>
  ) => {
    await use(new AtomicSearchBoxQuerySuggestionsPageObject(page));
  },
});

export {expect} from '@playwright/test';
