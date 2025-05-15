import {RecentQueriesListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';

const pageUrl = 's/quantic-recent-queries-list';

interface RecentQueriesListOptions {
  engineId: string;
  maxLength: number;
  label: string;
  hideWhenEmpty: boolean;
  isCollapsed: boolean;
}

type QuanticRecentQueriesListE2ESearchFixtures = {
  recentQueriesList: RecentQueriesListObject;
  search: SearchObject;
  options: Partial<RecentQueriesListOptions>;
  urlHash: string;
};

export const testSearch =
  quanticBase.extend<QuanticRecentQueriesListE2ESearchFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    recentQueriesList: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
      configuration.configure(options);
      await search.waitForSearchResponse();

      await use(new RecentQueriesListObject(page));
    },
  });

export {expect} from '@playwright/test';
