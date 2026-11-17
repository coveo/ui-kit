import {LoadMoreResultsObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const pageUrl = 's/quantic-load-more-results';

type QuanticLoadMoreResultsE2EFixtures = {
  loadMoreResults: LoadMoreResultsObject;
  search: SearchObject;
  emptyResults: boolean;
};

type QuanticLoadMoreResultsE2ESearchFixtures =
  QuanticLoadMoreResultsE2EFixtures;

type QuanticLoadMoreResultsE2EInsightFixtures =
  QuanticLoadMoreResultsE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticLoadMoreResultsE2ESearchFixtures>({
    emptyResults: false,
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    loadMoreResults: async (
      {page, configuration, search, emptyResults},
      use
    ) => {
      await search.mockSearchWithBaseResponse();
      if (emptyResults) {
        await search.mockEmptySearchResponse();
      }
      await page.goto(pageUrl);
      const searchResponsePromise = search.waitForSearchResponse();
      configuration.configure({});
      await searchResponsePromise;

      await use(new LoadMoreResultsObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticLoadMoreResultsE2EInsightFixtures>({
    emptyResults: false,
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    loadMoreResults: async (
      {page, search, configuration, insightSetup, emptyResults},
      use
    ) => {
      await search.mockSearchWithBaseResponse();
      if (emptyResults) {
        await search.mockEmptySearchResponse();
      }
      await page.goto(pageUrl);
      configuration.configure({useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await Promise.all([
        search.waitForSearchResponse(),
        search.performSearch(),
      ]);

      await use(new LoadMoreResultsObject(page));
    },
  });

export {expect} from '@playwright/test';
