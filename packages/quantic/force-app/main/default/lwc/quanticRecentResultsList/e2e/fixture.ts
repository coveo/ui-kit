import {RecentResultListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';
import {AnalyticsModeEnum} from '../../../../../../playwright/utils/analyticsMode';

const pageUrl = 's/quantic-recent-results-list';

interface RecentResultListOptions {
  engineId: string;
}

type QuanticRecentResultListE2ESearchFixtures = {
  recentResultList: RecentResultListObject;
  search: SearchObject;
  options: Partial<RecentResultListOptions>;
  urlHash: string;
};

export const testSearch =
  quanticBase.extend<QuanticRecentResultListE2ESearchFixtures>({
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

      await use(new RecentResultListObject(page, analytics));
    },
  });

export {expect} from '@playwright/test';
