import {FoldedResultListObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  insightSearchRequestRegex,
  searchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';

const pageUrl = 's/quantic-folded-result-list';

interface FoldedResultListOptions {
  fieldsToInclude: string;
  collectionField: string;
  parentField: string;
  childField: string;
  numberOfFoldedResults: number;
}

type QuanticFoldedResultListE2ESearchFixtures = {
  resultList: FoldedResultListObject;
  search: SearchObject;
  options: Partial<FoldedResultListOptions>;
};

type QuanticFoldedResultListE2EInsightFixtures =
  QuanticFoldedResultListE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticFoldedResultListE2ESearchFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    resultList: async ({page, options, configuration, search}, use) => {
      await page.goto(pageUrl);
      configuration.configure(options);
      await search.waitForSearchResponse();
      await search.waitForSearchResultsVisible();
      await use(new FoldedResultListObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticFoldedResultListE2EInsightFixtures>({
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
      await use(new FoldedResultListObject(page));
    },
  });

export {expect} from '@playwright/test';
