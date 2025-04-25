import {ResultCopyToClipboard} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {insightSearchRequestRegex} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';

const pageUrl = 's/quantic-result-copy-to-clipboard';

interface ResultCopyToClipboardOptions {
  engineId: string;
  result: string;
  label: string;
  successLabel: string;
  textTemplate: string;
}

type QuanticResultCopyToClipboardE2EInsightFixtures = {
  resultCopyToClipboard: ResultCopyToClipboard;
  search: SearchObject;
  options: Partial<ResultCopyToClipboardOptions>;
  insightSetup: InsightSetupObject;
};

export const testInsight =
  quanticBase.extend<QuanticResultCopyToClipboardE2EInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    resultCopyToClipboard: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(pageUrl);
      configuration.configure(options);
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new ResultCopyToClipboard(page));
    },
  });

export {expect} from '@playwright/test';
