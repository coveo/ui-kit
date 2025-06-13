import {ResultListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  insightSearchRequestRegex,
  searchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';

const pageUrl = 's/quantic-result-list';

interface ResultListOptions {
  fieldsToInclude: string;
}

type QuanticResultListE2ESearchFixtures = {
  resultList: ResultListObject;
  search: SearchObject;
  options: Partial<ResultListOptions>;
};

type QuanticResultListE2EInsightFixtures =
  QuanticResultListE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticResultListE2ESearchFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    resultList: async ({page, options, configuration, search}, use) => {
      await page.goto(pageUrl);
      configuration.configure(options);
      await search.waitForSearchResponse();
      await search.waitForSearchResultsVisible();
      await use(new ResultListObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticResultListE2EInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    resultList: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(pageUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await search.waitForSearchResultsVisible();
      await use(new ResultListObject(page));
    },
  });

export {expect} from '@playwright/test';
