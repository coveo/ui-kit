import {test, expect, commerceApi} from '../fixtures.js';
import {commercePage} from '../pages/commerce.js';

test('Commerce page renders products', async ({page, useHandlers}) => {
  await useHandlers(commerceApi.handlers);
  await page.setContent(commercePage);
  await page.waitForFunction(() =>
    customElements.get('atomic-commerce-interface')
  );
  await page.locator('atomic-commerce-interface').evaluate((el: any) =>
    el.initialize({
      accessToken: 'test-token',
      organizationId: 'testorg',
      analytics: {trackingId: 'smoke-test'},
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {url: 'https://example.com'},
      },
    })
  );
  await page
    .locator('atomic-commerce-interface')
    .evaluate((el: any) => el.executeFirstRequest());
  await page
    .locator('atomic-commerce-product-list atomic-product')
    .first()
    .waitFor();
  await expect(page).toHaveScreenshot();
});
