import {test, searchApi} from '../fixtures.js';

test('Search page renders results', async ({page, openPage, useHandlers}) => {
  await useHandlers(searchApi.handlers);
  await openPage('search.html');
  await page.waitForFunction(() => customElements.get('atomic-search-interface'));
  await page.locator('atomic-search-interface').evaluate((el: any) =>
    el.initialize({
      accessToken: 'test-token',
      organizationId: 'testorg',
    })
  );
  await page.locator('atomic-search-interface').evaluate((el: any) => el.executeFirstSearch());
  await page.locator('atomic-result-list atomic-result').first().waitFor();
});
