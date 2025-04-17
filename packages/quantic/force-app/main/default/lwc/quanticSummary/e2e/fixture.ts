import {SummaryObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';

const pageUrl = 's/quantic-summary';

interface SummaryOptions {
  engineId: string;
}

type QuanticSummaryE2EBaseFixtures = {
  summary: SummaryObject;
  search: SearchObject;
  options: Partial<SummaryOptions>;
};

type QuanticSummaryE2ESearchFixtures = QuanticSummaryE2EBaseFixtures & {
  urlHash: string;
};

type QuanticSummaryE2EInsightFixtures = QuanticSummaryE2ESearchFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticSummaryE2ESearchFixtures>({
  options: {},
  urlHash: '',
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  summary: async ({page, options, configuration, search, urlHash}, use) => {
    await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
    await configuration.configure(options);
    await search.waitForSearchResponse();
    await use(new SummaryObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticSummaryE2EInsightFixtures>(
  {
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    summary: async (
      {page, options, search, configuration, insightSetup},
      use
    ) => {
      await page.goto(pageUrl);
      await configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(new SummaryObject(page));
    },
  }
);

export {expect} from '@playwright/test';
