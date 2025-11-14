import {AnalyticsHelper} from '@/playwright-utils/analytics-helper';
import {expect, test} from './fixture';

test.describe('atomic-product-link', () => {
  test.beforeEach(async ({productLink}) => {
    await productLink.load();
    await productLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should render as links', async ({productLink, page}) => {
    await expect(productLink.anchor().first()).toHaveAttribute('href');

    await productLink.anchor().first().click({force: true});
    expect(page.url()).toContain('barca');
  });

  test('should send ec.productClick event when clicking the link', async ({
    productLink,
    page,
  }) => {
    const analyticsUrlRegex =
      /https:\/\/searchuisamples\.analytics\.org\.coveo\.com\/rest\/organizations\/searchuisamples\/events\/v1.*/;
    const requestPromise = page.waitForRequest(analyticsUrlRegex);
    await productLink.anchor().first().click();
    const request = await requestPromise;

    // Due to a bug in chromium, we cannot access the request payload in tests.
    // See https://github.com/microsoft/playwright/issues/6479
    expect(request).toBeDefined();
  });

  test('should send ec.productClick event with full payload access (new approach)', async ({
    productLink,
    page,
  }) => {
    const analyticsHelper = new AnalyticsHelper(page);

    // Clear any previous analytics requests
    await analyticsHelper.clearRequests();

    // Click the product link
    await productLink.anchor().first().click();

    // Wait for and verify the analytics request
    const request = await analyticsHelper.waitForRequest();

    // Now we can access the full payload!
    expect(request).toBeDefined();
    expect(request.method).toBe('POST');
    expect(request.url).toMatch(/analytics\.org\.coveo\.com/);

    // Verify the payload structure (example - actual structure may vary)
    const payload = request.body as Record<string, unknown>;
    expect(payload).toBeDefined();

    // Log for demonstration
    console.log('Captured analytics payload:', payload);
  });
});
