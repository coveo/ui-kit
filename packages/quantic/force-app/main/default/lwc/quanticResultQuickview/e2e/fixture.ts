import {ResultQuickviewObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
  searchHtmlRequestRegex,
  insightQuickviewRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {SearchObjectWithQuickview} from '../../../../../../playwright/page-object/searchObjectWithQuickview';

const resultQuickviewUrl = 's/quantic-result-quickview';

interface ResultQuickviewOptions {
  result: string;
  maximumPreviewSize: number;
  previewButtonIcon: string;
  previewButtonLabel: string;
  previewButtonVariant: string;
  tooltip: string;
}

type QuanticResultQuickviewE2EFixtures = {
  resultQuickview: ResultQuickviewObject;
  search: SearchObjectWithQuickview;
  options: Partial<ResultQuickviewOptions>;
};

type QuanticResultQuickviewE2ESearchFixtures =
  QuanticResultQuickviewE2EFixtures & {
    urlHash: string;
  };

type QuanticResultQuickviewE2EInsightFixtures =
  QuanticResultQuickviewE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticResultQuickviewE2ESearchFixtures>({
    options: {},
    urlHash: '',
    search: async ({page}, use) => {
      await use(
        new SearchObjectWithQuickview(
          page,
          searchRequestRegex,
          searchHtmlRequestRegex
        )
      );
    },
    resultQuickview: async ({page, options, configuration, urlHash}, use) => {
      await page.goto(
        urlHash ? `${resultQuickviewUrl}#${urlHash}` : resultQuickviewUrl
      );
      await configuration.configure(options);
      await use(new ResultQuickviewObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticResultQuickviewE2EInsightFixtures>({
    options: {},
    search: async ({page}, use) => {
      await use(
        new SearchObjectWithQuickview(
          page,
          insightSearchRequestRegex,
          insightQuickviewRequestRegex
        )
      );
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    resultQuickview: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(resultQuickviewUrl);
      await configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new ResultQuickviewObject(page));
    },
  });

export {expect} from '@playwright/test';
