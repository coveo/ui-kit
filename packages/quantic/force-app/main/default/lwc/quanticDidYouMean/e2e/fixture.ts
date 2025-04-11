import {DidYouMeanObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {
  insightSearchRequestRegex,
  searchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  DidYouMeanData,
  QueryTriggerData,
  SearchObjectWithDidYouMeanOrTrigger,
} from '../../../../../../playwright/page-object/searchObjectWithDidYouMean';
import mockData from './data';

const pageUrl = 's/quantic-did-you-mean';

interface DidYouMeanOptions {
  disableQueryAutoCorrection: boolean;
  queryCorrectionMode: string;
}

type QuanticDidYouMeanE2ESearchFixtures = {
  didYouMeanData?: DidYouMeanData;
  queryTriggerData?: QueryTriggerData;
  didYouMean: DidYouMeanObject;
  search: SearchObjectWithDidYouMeanOrTrigger;
  options: Partial<DidYouMeanOptions>;
};

type QuanticDidYouMeanE2EInsightFixtures =
  QuanticDidYouMeanE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticDidYouMeanE2ESearchFixtures>({
    didYouMeanData: mockData.didYouMeanData,
    queryTriggerData: mockData.queryTriggerData,
    options: {},
    search: async ({page}, use) => {
      await use(
        new SearchObjectWithDidYouMeanOrTrigger(page, searchRequestRegex)
      );
    },
    didYouMean: async ({page, options, configuration, search}, use) => {
      await page.goto(pageUrl);

      const searchResponsePromise = search.waitForSearchResponse();
      configuration.configure(options);
      await searchResponsePromise;

      await use(new DidYouMeanObject(page));
    },
  });

export const testInsight =
  quanticBase.extend<QuanticDidYouMeanE2EInsightFixtures>({
    didYouMeanData: mockData.didYouMeanData,
    queryTriggerData: mockData.queryTriggerData,
    options: {},
    search: async ({page}, use) => {
      await use(
        new SearchObjectWithDidYouMeanOrTrigger(page, insightSearchRequestRegex)
      );
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    didYouMean: async (
      {
        page,
        options,
        search,
        configuration,
        insightSetup,
        didYouMeanData,
        queryTriggerData,
      },
      use
    ) => {
      await page.goto(pageUrl);

      if (didYouMeanData) {
        await search.mockSearchWithDidYouMeanResponse(didYouMeanData);
      } else if (queryTriggerData) {
        await search.mockSearchWithQueryTriggerResponse(queryTriggerData);
      }

      configuration.configure({...options, useCase: 'insight'});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new DidYouMeanObject(page));
    },
  });

export {expect} from '@playwright/test';
