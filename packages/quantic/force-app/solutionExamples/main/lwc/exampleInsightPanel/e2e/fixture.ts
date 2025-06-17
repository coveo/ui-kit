import {ExampleInsightPanelObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';

const pageUrl = 's/insight-panel-example';

interface ExampleInsightPanelOptions {
  engineId: string;
  insightId: string;
  caseId: string;
};

type ExampleInsightPanelE2EFixtures = {
  exampleInsightPanel: ExampleInsightPanelObject;
  search: SearchObject;
  insightSetup: InsightSetupObject;
  options: Partial<ExampleInsightPanelOptions>;
};

export const testInsight = quanticBase.extend<ExampleInsightPanelE2EFixtures>({
  pageUrl: pageUrl,
  options: {},
  search: async ({page}, use) => {
    await use(new SearchObject(page, insightSearchRequestRegex));
  },
  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  exampleInsightPanel: async (
    {page, options, configuration, insightSetup},
    use
  ) => {
    await page.goto(pageUrl);

    configuration.configure({...options, useCase: useCaseEnum.insight});
    await insightSetup.waitForInsightInterfaceInitialization();
    await use(new ExampleInsightPanelObject(page));
  },
});

export {expect} from '@playwright/test';