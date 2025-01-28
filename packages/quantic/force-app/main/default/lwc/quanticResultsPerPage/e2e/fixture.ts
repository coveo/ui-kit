import {ResultsPerPageObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const resultsPerPageUrl = 's/quantic-results-per-page';

interface ResultsPerPageOptions {
  initialChoice: number;
  choicesDisplayed: string;
}

type QuanticResultsPerPageE2EFixtures = {
  resultsPerPage: ResultsPerPageObject;
  search: SearchObject;
  options: Partial<ResultsPerPageOptions>;
};

type QuanticResultsPerPageE2ESearchFixtures =
  QuanticResultsPerPageE2EFixtures & {
    urlHash: string;
  };

type QuanticResultsPerPageE2EInsightFixtures =
  QuanticResultsPerPageE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticResultsPerPageE2ESearchFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    resultsPerPage: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(
        urlHash ? `${resultsPerPageUrl}#${urlHash}` : resultsPerPageUrl
      );
      configuration.configure(options);
      await search.waitForSearchResponse();
      await use(new ResultsPerPageObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticResultsPerPageE2EInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    resultsPerPage: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(resultsPerPageUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new ResultsPerPageObject(page));
    },
  });
