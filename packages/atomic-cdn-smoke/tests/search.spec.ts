import {test, expect, searchApi} from '../fixtures.js';
import {searchPage} from '../pages/search.js';

test('Search page renders results', async ({page, useHandlers}) => {
  await useHandlers(searchApi.handlers);
  await page.setContent(searchPage);
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
