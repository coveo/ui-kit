import {expect, type Page, type Request, type Response} from '@playwright/test';
import {InsightPanelObject} from './pageObject';
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {insightInterfaceRequestRegex} from '../../../../../../playwright/utils/requests';

const pageUrl = 's/insight-panel-example';
const liveApiMessage = 'Insight interface config did not reach the live API';

const isInterfaceConfigRequest = (request: Request) =>
  insightInterfaceRequestRegex.test(request.url()) &&
  request.method() === 'GET';

/**
 * Resolves with the Insight interface config response, or rejects as soon as the request
 * fails without a response (e.g. a CORS-blocked `net::ERR_FAILED`).
 */
function waitForInterfaceConfigResponse(page: Page): Promise<Response> {
  let onRequestFailed: (request: Request) => void = () => {};
  const requestFailed = new Promise<never>((_, reject) => {
    onRequestFailed = (request) => {
      if (isInterfaceConfigRequest(request)) {
        reject(
          new Error(`${liveApiMessage}: ${request.failure()?.errorText}`)
        );
      }
    };
    page.on('requestfailed', onRequestFailed);
  });
  const response = Promise.race([
    page.waitForResponse((response) =>
      isInterfaceConfigRequest(response.request())
    ),
    requestFailed,
  ]).finally(() => page.off('requestfailed', onRequestFailed));
  // Awaited after page.goto; this keeps an early failure from being reported as unhandled.
  response.catch(() => {});
  return response;
}

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
    const interfaceConfigResponsePromise =
      waitForInterfaceConfigResponse(page);
    await page.goto(pageUrl);

    // This suite is the real Insight happy path: a response fulfilled by a route has no server address.
    const interfaceConfigResponse = await interfaceConfigResponsePromise;
    expect(interfaceConfigResponse.ok(), liveApiMessage).toBe(true);
    expect(
      await interfaceConfigResponse.serverAddr(),
      liveApiMessage
    ).not.toBeNull();

    await insightSetup.waitForInsightInterfaceInitialization();
    await firstSearchResponsePromise;
    // This is needed in order to ensure the console errors are properly captured.
    await page.waitForTimeout(100);
    await use(insightPanel);
  },
});

export {expect} from '@playwright/test';
