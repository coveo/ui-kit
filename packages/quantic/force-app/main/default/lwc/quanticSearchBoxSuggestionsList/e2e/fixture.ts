import {SearchBoxSuggestionsListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
  querySuggestRegex,
  insightQuerySuggestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {QuerySuggestObject} from '../../../../../../playwright/page-object/querySuggestObject';
import {AnalyticsModeEnum} from '../../../../../../playwright/utils/analyticsMode';

const searchBoxSuggestionsListUrl = 's/quantic-search-box';

interface SearchBoxSuggestionsListOptions {
  engineId?: string;
  maxNumberOfSuggestions: number;
}

type QuanticSearchBoxSuggestionsListE2EFixtures = {
  recentQueries: string[];
  searchBoxSuggestionsList: SearchBoxSuggestionsListObject;
  search: SearchObject;
  querySuggest: QuerySuggestObject;
  options: Partial<SearchBoxSuggestionsListOptions>;
};

type QuanticSearchBoxSuggestionsListE2ESearchFixtures =
  QuanticSearchBoxSuggestionsListE2EFixtures;

type QuanticSearchBoxSuggestionsListE2eInsightFixtures =
  QuanticSearchBoxSuggestionsListE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticSearchBoxSuggestionsListE2ESearchFixtures>({
    pageUrl: searchBoxSuggestionsListUrl,
    options: {},
    analyticsMode: AnalyticsModeEnum.legacy,
    recentQueries: [],
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    querySuggest: async ({page}, use) => {
      await use(new QuerySuggestObject(page, querySuggestRegex));
    },
    searchBoxSuggestionsList: async (
      {
        page,
        options,
        configuration,
        search,
        analytics,
        querySuggest,
        recentQueries,
      },
      use
    ) => {
      await page.goto(searchBoxSuggestionsListUrl);
      if (recentQueries.length > 0) {
        await querySuggest.setRecentQueries(recentQueries);
      }

      configuration.configure(options);
      await search.waitForSearchResponse();
      await use(new SearchBoxSuggestionsListObject(page, analytics));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticSearchBoxSuggestionsListE2eInsightFixtures>({
    pageUrl: searchBoxSuggestionsListUrl,
    options: {},
    analyticsMode: AnalyticsModeEnum.legacy,
    recentQueries: [],
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    querySuggest: async ({page}, use) => {
      await use(new QuerySuggestObject(page, insightQuerySuggestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    searchBoxSuggestionsList: async (
      {
        page,
        options,
        configuration,
        insightSetup,
        querySuggest,
        analytics,
        recentQueries,
      },
      use
    ) => {
      await page.goto(searchBoxSuggestionsListUrl);
      if (recentQueries.length > 0) {
        await querySuggest.setRecentQueries(recentQueries);
      }
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await use(new SearchBoxSuggestionsListObject(page, analytics));
    },
  });

export {expect} from '@playwright/test';
