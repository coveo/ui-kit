import {TabBarObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const pageUrl = 's/quantic-tab-bar';

interface TabBarOptions {
  lightTheme: boolean;
}

type QuanticTabBarE2EFixtures = {
  tabBar: TabBarObject;
  search: SearchObject;
  options: Partial<TabBarOptions>;
};

type QuanticTabBarE2ESearchFixtures = QuanticTabBarE2EFixtures;

type QuanticTabBarE2EInsightFixtures = QuanticTabBarE2ESearchFixtures & {
  insightSetup: InsightSetupObject;
};

export const testSearch = quanticBase.extend<QuanticTabBarE2ESearchFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  tabBar: async ({page, options, configuration, search}, use) => {
    await page.goto(pageUrl);
    configuration.configure(options);
    await search.waitForSearchResponse();

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
    await page.goto(pageUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new TabBarObject(page));
  },
});

export {expect} from '@playwright/test';
