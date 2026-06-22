import {test, expect, insightApi} from '../fixtures.js';
import {insightPage} from '../pages/insight.js';
import {http, HttpResponse} from 'msw';

const interfaceConfigHandler = http.get(
  'https://:orgId.org.coveo.com/rest/organizations/:orgId/insight/v1/configs/:insightId/interface',
  () => HttpResponse.json({})
);

test('Insight page renders results', async ({page, useHandlers}) => {
  await useHandlers([interfaceConfigHandler, ...insightApi.handlers]);
  await page.setContent(insightPage);
  await page.waitForFunction(() =>
    customElements.get('atomic-insight-interface')
  );
  await page.locator('atomic-insight-interface').evaluate((el: any) =>
    el.initialize({
      accessToken: 'test-token',
      organizationId: 'testorg',
      insightId: 'test-insight-id',
    })
  );
  await page
    .locator('atomic-insight-interface')
    .evaluate((el: any) => el.executeFirstSearch());
  await page
    .locator('atomic-insight-result-list atomic-insight-result')
    .first()
    .waitFor();
  await expect(page).toHaveScreenshot();
});
