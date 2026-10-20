import {expect, test} from '@playwright/test';
import {SearchPageObject} from '../page-objects/search.page';

const clientIdCookieName = 'coveo_visitorId';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readClientIdCookie = async (context: {
  cookies: () => Promise<{name: string; value: string}[]>;
}) => (await context.cookies()).find((cookie) => cookie.name === clientIdCookieName)?.value;

test.describe('client ID', () => {
  test('should store the client ID of a new visitor in a cookie and keep it on the next request', async ({
    page,
    context,
  }) => {
    await page.goto('/search');
    const firstClientId = await readClientIdCookie(context);
    expect(firstClientId).toMatch(uuidPattern);

    await page.goto('/cart');
    const secondClientId = await readClientIdCookie(context);
    expect(secondClientId).toBe(firstClientId);
  });

  test('should send the client ID of the cookie with the requests made from the browser', async ({
    page,
    context,
  }) => {
    await page.goto('/search');
    const clientId = await readClientIdCookie(context);

    const commerceRequest = page.waitForRequest(
      (request) => request.url().includes('/commerce/v2/') && request.method() === 'POST'
    );
    await new SearchPageObject(page).searchBox.fill('shoes');

    expect((await commerceRequest).postDataJSON().clientId).toBe(clientId);
  });
});
