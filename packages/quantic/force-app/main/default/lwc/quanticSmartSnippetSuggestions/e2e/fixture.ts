import {SmartSnippetSuggestionsObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  SearchObjectWithSmartSnippet,
  RelatedQuestionsData,
} from '../../../../../../playwright/page-object/searchObjectWithSmartSnippet';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import smartSnippetSuggestionsData from './data';

const pageUrl = 's/quantic-smart-snippet-suggestions';

interface SmartSnippetSuggestionsOptions {}

type QuanticSmartSnippetSuggestionsE2ESearchFixtures = {
  smartSnippetSuggestionsData: RelatedQuestionsData;
  smartSnippetSuggestions: SmartSnippetSuggestionsObject;
  search: SearchObjectWithSmartSnippet;
  options: Partial<SmartSnippetSuggestionsOptions>;
};

type QuanticSmartSnippetSuggestionsE2EInsightFixtures =
  QuanticSmartSnippetSuggestionsE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticSmartSnippetSuggestionsE2ESearchFixtures>({
    smartSnippetSuggestionsData,
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObjectWithSmartSnippet(page, searchRequestRegex));
    },
    smartSnippetSuggestions: async (
      {page, options, configuration, search, smartSnippetSuggestionsData: data},
      use
    ) => {
      const smartSnippetSuggestionsObject = new SmartSnippetSuggestionsObject(
        page
      );

      await page.goto(pageUrl);
      await search.mockSearchWithSmartSnippetSuggestionsResponse(data);

      configuration.configure(options);
      await search.waitForSearchResponse();
      await use(smartSnippetSuggestionsObject);
    },
  });

export const testInsight =
  quanticBase.extend<QuanticSmartSnippetSuggestionsE2EInsightFixtures>({
    smartSnippetSuggestionsData,
    options: {},
    search: async ({page}, use) => {
      await use(
        new SearchObjectWithSmartSnippet(page, insightSearchRequestRegex)
      );
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    smartSnippetSuggestions: async (
      {
        page,
        options,
        search,
        configuration,
        insightSetup,
        smartSnippetSuggestionsData: data,
      },
      use
    ) => {
      const smartSnippetSuggestionsObject = new SmartSnippetSuggestionsObject(
        page
      );

      await page.goto(pageUrl);
      await search.mockSearchWithSmartSnippetSuggestionsResponse(data);

      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(smartSnippetSuggestionsObject);
    },
  });

export {expect} from '@playwright/test';
