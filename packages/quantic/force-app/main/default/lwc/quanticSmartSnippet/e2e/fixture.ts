import {SmartSnippetObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const smartSnippetUrl = 's/quantic-smart-snippet';

interface SmartSnippetOptions {
  maximumSnippetHeight: number;
}

type QuanticSmartSnippetE2EFixtures = {
  smartSnippet: SmartSnippetObject;
  search: SearchObject;
  options: Partial<SmartSnippetOptions>;
};

type QuanticSmartSnippetE2ESearchFixtures = QuanticSmartSnippetE2EFixtures & {
  urlHash: string;
};

type QuanticSmartSnippetE2EInsightFixtures =
  QuanticSmartSnippetE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticSmartSnippetE2ESearchFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    smartSnippet: async (
      {page, options, configuration, search, urlHash},
      use
    ) => {
      await page.goto(
        urlHash ? `${smartSnippetUrl}#${urlHash}` : smartSnippetUrl
      );
      configuration.configure(options);
      await search.waitForSearchResponse();

      await use(new SmartSnippetObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticSmartSnippetE2EInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    smartSnippet: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(smartSnippetUrl);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new SmartSnippetObject(page));
    },
  });

export {expect} from '@playwright/test';
