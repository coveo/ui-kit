import {SearchPageObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';

const pageUrl = 's/full-search-example';

type SearchPageE2EFixtures = {
  searchPage: SearchPageObject;
  search: SearchObject;
};

export const testSearch = quanticBase.extend<SearchPageE2EFixtures>({
  pageUrl: pageUrl,
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  searchPage: async ({page, search}, use) => {
    await page.goto(pageUrl);
    const searchResponsePromise = search.waitForSearchResponse();
    await searchResponsePromise;

    await use(new SearchPageObject(page));
  },
});

export {expect} from '@playwright/test';
