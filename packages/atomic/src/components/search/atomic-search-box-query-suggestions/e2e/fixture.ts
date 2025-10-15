import type {Page} from '@playwright/test';
import {test as base} from '@playwright/test';
import {type AxeFixture, makeAxeBuilder} from '@/playwright-utils/base-fixture';
import {AtomicSearchBoxQuerySuggestionsPageObject} from './page-object';

type Fixtures = {
  searchBoxQuerySuggestions: AtomicSearchBoxQuerySuggestionsPageObject;
};

export const test = base.extend<Fixtures & AxeFixture>({
  makeAxeBuilder,
  searchBoxQuerySuggestions: async (
    {page}: {page: Page},
    use: (r: AtomicSearchBoxQuerySuggestionsPageObject) => Promise<void>
  ) => {
    await use(new AtomicSearchBoxQuerySuggestionsPageObject(page));
  },
});

export {expect} from '@playwright/test';
