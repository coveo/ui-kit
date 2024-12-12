import {SmartSnippetSuggestionsObject} from './smartSnippetSuggestionsObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const smartSnippetSuggestionsUrl = 's/quantic-smart-snippet-suggestions';

interface SmartSnippetSuggestionsOptions {}

type QuanticSmartSnippetSuggestionsE2EFixtures = {
  smartSnippetSuggestions: SmartSnippetSuggestionsObject;
  search: SearchObject;
  options: Partial<SmartSnippetSuggestionsOptions>;
};

type QuanticSmartSnippetSuggestionsE2ESearchFixtures =
  QuanticSmartSnippetSuggestionsE2EFixtures & {
    urlHash: string;
  };

type QuanticSmartSnippetSuggestionsE2EInsightFixtures =
  QuanticSmartSnippetSuggestionsE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticSmartSnippetSuggestionsE2ESearchFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    smartSnippetSuggestions: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(
        urlHash
          ? `${smartSnippetSuggestionsUrl}#${urlHash}`
          : smartSnippetSuggestionsUrl
      );
      configuration.configure(options);
      await search.waitForSearchResponse();

      await use(new SmartSnippetSuggestionsObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticSmartSnippetSuggestionsE2EInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    smartSnippetSuggestions: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(smartSnippetSuggestionsUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new SmartSnippetSuggestionsObject(page));
    },
  });

export {expect} from '@playwright/test';