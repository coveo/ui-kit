import {test as base} from '@playwright/test';
import {AtomicCommerceSearchBoxQuerySuggestionsPageObject} from './page-object';

type Fixtures = {
  commerceSearchBoxQuerySuggestions: AtomicCommerceSearchBoxQuerySuggestionsPageObject;
};

export const test = base.extend<Fixtures>({
  commerceSearchBoxQuerySuggestions: async ({page}, use) => {
    await use(new AtomicCommerceSearchBoxQuerySuggestionsPageObject(page));
  },
});

export {expect} from '@playwright/test';
