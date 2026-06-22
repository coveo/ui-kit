import {test, expect, searchApi} from '../fixtures.js';
import {ipxPage} from '../pages/ipx.js';

test('IPX modal renders results', async ({page, useHandlers}) => {
  await useHandlers(searchApi.handlers);
  await page.setContent(ipxPage);
  await page.waitForFunction(() =>
    customElements.get('atomic-search-interface')
  );
  await page.locator('atomic-search-interface').evaluate((el: any) =>
    el.initialize({
      accessToken: 'test-token',
      organizationId: 'testorg',
    })
  );
  await page
    .locator('atomic-search-interface')
    .evaluate((el: any) => el.executeFirstSearch());
  await page.locator('atomic-result-list atomic-result').first().waitFor();
  await expect(page).toHaveScreenshot();
});
