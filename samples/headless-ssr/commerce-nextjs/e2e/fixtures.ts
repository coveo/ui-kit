import {expect, test as base} from '@playwright/test';

/**
 * Every Coveo Commerce API call — server-side (SSR) and client-side (hydration /
 * interactions) — is routed to the @mswjs/http-middleware mock server through the
 * engine's proxyBaseUrl.
 *
 * The client half of that only works when NEXT_PUBLIC_MOCK_API_URL is set at build
 * time, since Next.js bakes it into the client bundle. This fixture fails the test
 * when the browser reaches the live API instead, which would otherwise turn these
 * tests into flaky assertions against production data.
 *
 * Analytics events are not proxied and still reach the live endpoint, so they are
 * deliberately left alone here.
 */
export const test = base.extend<{blockLiveApiCalls: void}>({
  blockLiveApiCalls: [
    async ({page}, use) => {
      const liveCalls: string[] = [];

      await page.route(
        (url) => url.hostname !== 'localhost' && url.pathname.includes('/commerce/v2'),
        async (route) => {
          liveCalls.push(route.request().url());
          await route.abort();
        }
      );

      await use();

      expect(
        liveCalls,
        'The browser called the live Coveo API instead of the mock server. Check that NEXT_PUBLIC_MOCK_API_URL is set when the app is built.'
      ).toEqual([]);
    },
    {auto: true},
  ],
});

export {expect};
