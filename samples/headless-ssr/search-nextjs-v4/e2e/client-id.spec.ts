import {type BrowserContext, expect, type Request, test} from '@playwright/test';
import {gotoAndHydrate, routes, submitQuery} from './utils';

const clientIdCookieName = 'coveo_visitorId';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readClientIdCookie = async (context: BrowserContext) =>
  (await context.cookies()).find((cookie) => cookie.name === clientIdCookieName)?.value;

const isSearchRequest = (request: Request) =>
  request.method() === 'POST' && new URL(request.url()).pathname === '/rest/search/v2';

test.describe('client ID', () => {
  test('stores the client ID of a new visitor in a cookie and keeps it on the next request', async ({
    page,
    context,
  }) => {
    await page.goto('/react');
    const firstClientId = await readClientIdCookie(context);
    expect(firstClientId).toMatch(uuidPattern);

    await page.goto('/generic');
    expect(await readClientIdCookie(context)).toBe(firstClientId);
  });

  test('replaces a client ID cookie that is not a UUID', async ({page, context}) => {
    await context.addCookies([
      {name: clientIdCookieName, value: 'not-a-uuid', domain: 'localhost', path: '/'},
    ]);

    await page.goto('/react');

    expect(await readClientIdCookie(context)).toMatch(uuidPattern);
  });

  for (const route of routes) {
    test(`sends the client ID of the cookie with the searches of the ${route} page`, async ({
      page,
      context,
    }) => {
      await gotoAndHydrate(page, `/${route}`);
      const clientId = await readClientIdCookie(context);

      const searchRequest = page.waitForRequest(isSearchRequest);
      await submitQuery(page, 'abc');

      expect((await searchRequest).postDataJSON().analytics.clientId).toBe(clientId);
    });
  }
});
