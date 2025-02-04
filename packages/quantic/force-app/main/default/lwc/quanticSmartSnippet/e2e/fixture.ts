import {SmartSnippetObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  SearchObjectWithSmartSnippet,
  QuestionAnswerData,
} from '../../../../../../playwright/page-object/searchObjectWithSmartSnippet';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import smartSnippetData from './data';

const pageUrl = 's/quantic-smart-snippet';

interface SmartSnippetOptions {
  maximumSnippetHeight: number;
}

type QuanticSmartSnippetE2ESearchFixtures = {
  smartSnippetData: QuestionAnswerData;
  smartSnippet: SmartSnippetObject;
  search: SearchObjectWithSmartSnippet;
  options: Partial<SmartSnippetOptions>;
};

type QuanticSmartSnippetE2EInsightFixtures =
  QuanticSmartSnippetE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticSmartSnippetE2ESearchFixtures>({
    smartSnippetData,
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObjectWithSmartSnippet(page, searchRequestRegex));
    },
    smartSnippet: async (
      {page, options, configuration, search, smartSnippetData: data},
      use
    ) => {
      const smartSnippetObject = new SmartSnippetObject(page);

      await page.goto(pageUrl);
      await search.mockSearchWithSmartSnippetResponse(data);

      configuration.configure(options);
      await search.waitForSearchResponse();
      await use(smartSnippetObject);
    },
  });

export const testInsight =
  quanticBase.extend<QuanticSmartSnippetE2EInsightFixtures>({
    smartSnippetData,
    options: {},
    search: async ({page}, use) => {
      await use(
        new SearchObjectWithSmartSnippet(page, insightSearchRequestRegex)
      );
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    smartSnippet: async (
      {
        page,
        options,
        search,
        configuration,
        insightSetup,
        smartSnippetData: data,
      },
      use
    ) => {
      const smartSnippetObject = new SmartSnippetObject(page);

      await page.goto(pageUrl);
      await search.mockSearchWithSmartSnippetResponse(data);

      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(smartSnippetObject);
    },
  });

export {expect} from '@playwright/test';
