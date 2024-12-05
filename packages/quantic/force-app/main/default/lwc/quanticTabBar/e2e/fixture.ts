import {TabBarObject} from './tabBarObject';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';

const tabBarUrl = 's/quantic-tab-bar';

interface TabBarOptions {
  lightTheme: boolean;
}

type QuanticTabBarE2EFixtures = {
  tabBar: TabBarObject;
  search: SearchObject;
  options: Partial<TabBarOptions>;
};

type QuanticTabBarE2ESearchFixtures = QuanticTabBarE2EFixtures & {
  urlHash: string;
};

type QuanticTabBarE2EInsightFixtures = QuanticTabBarE2EFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticTabBarE2ESearchFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  tabBar: async ({page}, use) => {
    await page.goto(tabBarUrl);
    await use(new TabBarObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticTabBarE2EInsightFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  tabBar: async ({page, options, search, configuration, insightSetup}, use) => {
    await page.goto(tabBarUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new TabBarObject(page));
  },
});

export {expect} from '@playwright/test';
