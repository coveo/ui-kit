import {test, expect, insightApi} from '../fixtures.js';

test('Insight page renders results', async ({page, openPage, useHandlers}) => {
  await useHandlers(insightApi.handlers);
  await openPage('insight.html');
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
