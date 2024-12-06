import {TabObject} from './tabObject';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';

const tabUrl = 's/quantic-tab';

interface TabBarOptions {}

type QuanticTabE2EFixtures = {
  tab: TabObject;
  search: SearchObject;
  options: Partial<TabBarOptions>;
};

type QuanticTabE2ESearchFixtures = QuanticTabE2EFixtures & {
  urlHash: string;
};

type QuanticTabE2EInsightFixtures = QuanticTabE2ESearchFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticTabE2ESearchFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  tab: async ({page}, use) => {
    await page.goto(tabUrl);
    await use(new TabObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticTabE2EInsightFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  tab: async ({page, options, search, configuration, insightSetup}, use) => {
    await page.goto(tabUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new TabObject(page));
  },
});

export {expect} from '@playwright/test';
