import type {Page} from '@playwright/test';
import {expect} from '@playwright/test';
import {test, commerceApi} from '../fixtures.js';

// The Atomic autoloader logs this error and never retries when a component
// chunk fails to load from the CDN. `initialize` then waits forever on
// `customElements.whenDefined`, so we fail with the cause instead.
function failOnAtomicRegistrationError(page: Page) {
  return new Promise<never>((_, reject) => {
    page.on('console', (message) => {
      if (message.type() === 'error' && message.text().startsWith('[Atomic] Failed to register')) {
        reject(new Error(message.text()));
      }
    });
  });
}

test('Commerce page renders products', async ({page, openPage, useHandlers}) => {
  const registrationError = failOnAtomicRegistrationError(page);
  await useHandlers(commerceApi.handlers);
  await openPage('commerce.html');

  await Promise.race([
    (async () => {
      await page.waitForFunction(() => customElements.get('atomic-commerce-interface'));
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

      await expect(page.locator('atomic-commerce-interface')).toHaveClass(
        /atomic-commerce-interface-search-executed/
      );
      await expect(
        page.locator('atomic-commerce-product-list atomic-product').first()
      ).toBeVisible();
      await expect(
        page.locator('atomic-commerce-product-list atomic-result-placeholder')
      ).toHaveCount(0);
      await expect(page.locator('atomic-commerce-interface :not(:defined)')).toHaveCount(0);
    })(),
    registrationError,
  ]);
});
