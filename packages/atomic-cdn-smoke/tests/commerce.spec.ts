import {test, commerceApi} from '../fixtures.js';

test('Commerce page renders products', async ({
  page,
  openPage,
  useHandlers,
}) => {
  await useHandlers(commerceApi.handlers);
  await openPage('commerce.html');
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
});
