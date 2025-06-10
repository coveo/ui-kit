import {RecentResultListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {searchRequestRegex} from '../../../../../../playwright/utils/requests';

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
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    recentResultList: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
      const searchResponsePromise = search.waitForSearchResponse();
      configuration.configure(options);
      await searchResponsePromise;

      await use(new RecentResultListObject(page));
    },
  });

export {expect} from '@playwright/test';
