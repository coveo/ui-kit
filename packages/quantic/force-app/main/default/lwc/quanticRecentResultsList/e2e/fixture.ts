import {RecentResultListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';

const pageUrl = 's/quantic-recent-results-list';

interface RecentQueriesListOptions {
  engineId: string;
  // todo: add more options as needed
}

type QuanticRecentQueriesListE2ESearchFixtures = {
  recentResultList: RecentResultListObject;
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
    recentResultList: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
      configuration.configure(options);
      await search.waitForSearchResponse();

      await use(new RecentResultListObject(page));
    },
  });

export {expect} from '@playwright/test';
