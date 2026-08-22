import {LoadMoreResultsObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const loadMoreResultsUrl = 's/quantic-load-more-results';

type QuanticLoadMoreResultsE2EFixtures = {
  loadMoreResults: LoadMoreResultsObject;
  search: SearchObject;
};

type QuanticLoadMoreResultsE2EInsightFixtures =
  QuanticLoadMoreResultsE2EFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticLoadMoreResultsE2EFixtures>({
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    loadMoreResults: async ({page, configuration, search}, use) => {
      await search.mockSearchWithLoadMoreSequence();
      await page.goto(loadMoreResultsUrl);
      configuration.configure({});
      await search.waitForSearchResponse();
      await use(new LoadMoreResultsObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticLoadMoreResultsE2EInsightFixtures>({
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    loadMoreResults: async (
      {page, search, configuration, insightSetup},
      use
    ) => {
      await search.mockSearchWithLoadMoreSequence();
      await page.goto(loadMoreResultsUrl);
      configuration.configure({useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await Promise.all([
        search.waitForSearchResponse(),
        search.performSearch(),
      ]);
      await use(new LoadMoreResultsObject(page));
    },
  });
