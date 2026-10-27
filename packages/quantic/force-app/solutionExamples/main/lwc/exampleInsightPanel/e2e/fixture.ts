import {InsightPanelObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';

const pageUrl = 's/insight-panel-example';

type InsightPanelE2EFixtures = {
  insightPanel: InsightPanelObject;
  insightSetup: InsightSetupObject;
  consoleErrors: string[];
};

export const testInsight = quanticBase.extend<InsightPanelE2EFixtures>({
  consoleErrors: async ({page}, use) => {
    const consoleErrors: string[] = [];

    // Listening for console errors before the page is loaded.
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[CAPTURED] Console error: ${msg.text()}`);
        consoleErrors.push(msg.text());
      }
    });

    await use(consoleErrors);
  },

  insightSetup: async ({page}, use) => {
    await use(new InsightSetupObject(page));
  },
  insightPanel: async ({page, insightSetup}, use) => {
    const insightPanel = new InsightPanelObject(page);
    const firstSearchResponsePromise =
      insightPanel.waitForSuccessfulSearchResponse(() => true);
    await page.goto(pageUrl);

    await insightSetup.waitForInsightInterfaceInitialization();
    await firstSearchResponsePromise;
    // This is needed in order to ensure the console errors are properly captured.
    await page.waitForTimeout(100);
    await use(insightPanel);
  },
});

export {expect} from '@playwright/test';
