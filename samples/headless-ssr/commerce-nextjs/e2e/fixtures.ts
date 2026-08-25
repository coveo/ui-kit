import {expect, test as base} from '@playwright/test';

const isCommerceApiCall = (url: string) => url.includes('/commerce/v2');

/**
 * Every Coveo Commerce API call — server-side (SSR) and client-side (hydration /
 * interactions) — is routed to the @mswjs/http-middleware mock server through the
 * engine's proxyBaseUrl. The client half depends on the root layout publishing
 * MOCK_API_URL to the browser.
 *
 * This fixture fails the test when a browser Commerce API call either reaches the
 * live API or does not succeed against the mock. Both cases otherwise go unnoticed:
 * headless leaves the server-rendered state in place when a request fails, so
 * assertions keep passing against stale data instead of what they mean to check.
 *
 * Analytics events are not proxied and still reach the live endpoint, so they are
 * deliberately left alone here.
 */
export const test = base.extend<{checkCommerceApiCalls: void}>({
  checkCommerceApiCalls: [
    async ({page}, use) => {
      const problems: string[] = [];

      await page.route(
        (url) => url.hostname !== 'localhost' && isCommerceApiCall(url.pathname),
        async (route) => {
          problems.push(`reached the live API: ${route.request().url()}`);
          await route.abort();
        }
      );

      page.on('requestfailed', (request) => {
        const url = request.url();
        if (isCommerceApiCall(url) && new URL(url).hostname === 'localhost') {
          problems.push(`request failed: ${url} (${request.failure()?.errorText})`);
        }
      });

      page.on('response', (response) => {
        if (isCommerceApiCall(response.url()) && !response.ok()) {
          problems.push(`responded ${response.status()}: ${response.url()}`);
        }
      });

      await use();

      expect(
        problems,
        'Commerce API calls made by the browser did not all reach the mock server'
      ).toEqual([]);
    },
    {auto: true},
  ],
});

export {expect};
