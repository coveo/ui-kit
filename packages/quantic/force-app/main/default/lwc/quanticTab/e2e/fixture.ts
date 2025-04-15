import {TabObject} from './pageObject';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';

const pageUrl = 's/quantic-tab';

interface TabOptions {}

type QuanticTabE2EFixtures = {
  tab: TabObject;
  search: SearchObject;
  options: Partial<TabOptions>;
  insightSetup?: InsightSetupObject;
  urlHash?: string;
};

export const testSearch = quanticBase.extend<QuanticTabE2EFixtures>({
  options: {},
  urlHash: '',
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  tab: async ({page, options, configuration, search, urlHash}, use) => {
    await page.goto(urlHash ? `${pageUrl}#${urlHash}` : pageUrl);
    configuration.configure(options);
    await search.waitForSearchResponse();

    await use(new TabObject(page));
  },
});

export const testInsight = quanticBase.extend<QuanticTabE2EFixtures>({
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  tab: async ({page, options, search, configuration, insightSetup}, use) => {
    await page.goto(pageUrl);
    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup!.waitForInsightInterfaceInitialization();
    await search.performSearch();
    await search.waitForSearchResponse();
    await use(new TabObject(page, 'insight'));
  },
});

export {expect} from '@playwright/test';
