import {InsightPanelObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {insightSearchRequestRegex} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';

const pageUrl = 's/insight-panel-example';

type InsightPanelE2EFixtures = {
  insightPanel: InsightPanelObject;
  search: SearchObject;
  insightSetup: InsightSetupObject;
};

export const testInsight = quanticBase.extend<InsightPanelE2EFixtures>({
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  insightPanel: async ({page, insightSetup, search}, use) => {
    await page.goto(pageUrl);

    await insightSetup.waitForInsightInterfaceInitialization();
    await search.waitForSearchResponse();
    await use(new InsightPanelObject(page));
  },
});

export {expect} from '@playwright/test';
