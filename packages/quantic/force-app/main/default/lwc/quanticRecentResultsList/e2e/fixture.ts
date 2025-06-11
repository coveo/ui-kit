import {RecentResultsListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';
import {AnalyticsModeEnum} from '../../../../../../playwright/utils/analyticsMode';

const pageUrl = 's/quantic-recent-results-list';

interface RecentResultsListOptions {
  engineId: string;
}

type QuanticRecentResultsListE2ESearchFixtures = {
  recentResultList: RecentResultsListObject;
  search: SearchObject;
  options: Partial<RecentResultsListOptions>;
  urlHash: string;
};

export const testSearch =
  quanticBase.extend<QuanticRecentResultsListE2ESearchFixtures>({
    options: {},
    pageUrl: pageUrl,
    urlHash: '',
    analyticsMode: AnalyticsModeEnum.legacy,
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    recentResultList: async (
      {page, options, configuration, search, urlHash, analytics},
      use
    ) => {
      await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
      const searchResponsePromise = search.waitForSearchResponse();
      await configuration.configure(options);
      await searchResponsePromise;

      await use(new RecentResultsListObject(page, analytics));
    },
  });

export {expect} from '@playwright/test';
