import {type BrowserContext, expect, type Page, test} from '@playwright/test';
import {CartPageObject} from '../page-objects/cart.page';
import {SearchPageObject} from '../page-objects/search.page';

const clientIdCookieName = 'coveo_visitorId';
const consentCookieName = 'analytics_consent';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readCookie = async (context: BrowserContext, name: string) =>
  (await context.cookies()).find((cookie) => cookie.name === name)?.value;

const readClientIdCookie = (context: BrowserContext) => readCookie(context, clientIdCookieName);

const consentCookie = (value: 'granted' | 'denied') => ({
  name: consentCookieName,
  value,
  domain: 'localhost',
  path: '/',
});

const nextCommerceRequest = (page: Page) =>
  page.waitForRequest(
    (request) => request.url().includes('/commerce/v2/') && request.method() === 'POST'
  );

const isAnalyticsEvent = (url: string) => url.includes('/events/v1');

const addFirstProductToCart = async (page: Page, context: BrowserContext) => {
  await new CartPageObject(page).addToCartButton.first().click();
  // The click also writes the cart to a cookie through a server action: once it is there, the click
  // was handled, analytics event included.
  await expect.poll(() => readCookie(context, 'headless-cart')).toBeDefined();
};

test.describe('client ID', () => {
  test.describe('when the visitor agreed to analytics', () => {
    test.beforeEach(async ({context}) => {
      await context.addCookies([consentCookie('granted')]);
    });

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

    test('should replace a client ID cookie that is not a UUID and keep the replacement', async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {name: clientIdCookieName, value: 'not-a-uuid', domain: 'localhost', path: '/'},
      ]);

      await page.goto('/search');
      const replacedClientId = await readClientIdCookie(context);
      expect(replacedClientId).toMatch(uuidPattern);

      await page.goto('/cart');
      expect(await readClientIdCookie(context)).toBe(replacedClientId);
    });

    test('should send the client ID of the cookie with the requests made from the browser', async ({
      page,
      context,
    }) => {
      await page.goto('/search');
      const clientId = await readClientIdCookie(context);

      const commerceRequest = nextCommerceRequest(page);
      await new SearchPageObject(page).searchBox.fill('shoes');

      const body = (await commerceRequest).postDataJSON();
      expect(body.clientId).toBe(clientId);
      expect(body.context.capture).toBe(true);
    });

    test('should send the analytics events of the browser with the client ID of the cookie', async ({
      page,
      context,
    }) => {
      await page.goto('/toys');
      const clientId = await readClientIdCookie(context);

      const analyticsEvent = page.waitForRequest((request) => isAnalyticsEvent(request.url()));
      await addFirstProductToCart(page, context);

      const [event] = (await analyticsEvent).postDataJSON();
      expect(event.meta.clientId).toBe(clientId);
    });
  });

  test.describe('when the visitor has not agreed to analytics', () => {
    test('should store no client ID and send none with the requests made from the browser', async ({
      page,
      context,
    }) => {
      await page.goto('/search');
      expect(await readClientIdCookie(context)).toBeUndefined();

      const commerceRequest = nextCommerceRequest(page);
      await new SearchPageObject(page).searchBox.fill('shoes');

      const body = (await commerceRequest).postDataJSON();
      expect(body).not.toHaveProperty('clientId');
      expect(body.context.capture).toBe(false);
      expect(await readClientIdCookie(context)).toBeUndefined();
    });

    test('should send no analytics event from the browser', async ({page, context}) => {
      const analyticsEvents: string[] = [];
      page.on('request', (request) => {
        if (isAnalyticsEvent(request.url())) {
          analyticsEvents.push(request.url());
        }
      });

      await page.goto('/toys');
      await addFirstProductToCart(page, context);

      expect(analyticsEvents).toEqual([]);
    });

    test('should remove the client ID cookie of a visitor who declined', async ({
      page,
      context,
    }) => {
      await context.addCookies([
        consentCookie('denied'),
        {
          name: clientIdCookieName,
          value: '3f2b1a9c-0d4e-4f6a-8b7c-9d0e1f2a3b4c',
          domain: 'localhost',
          path: '/',
        },
      ]);

      await page.goto('/search');

      expect(await readClientIdCookie(context)).toBeUndefined();
    });

    test('should start tracking on the same page once the visitor accepts', async ({
      page,
      context,
    }) => {
      await page.goto('/search');

      await page.getByRole('button', {name: 'Accept analytics'}).click();
      await expect.poll(() => readClientIdCookie(context)).toMatch(uuidPattern);
      await expect(page.getByRole('region', {name: 'Analytics consent'})).toBeHidden();
      const clientId = await readClientIdCookie(context);

      const commerceRequest = nextCommerceRequest(page);
      await new SearchPageObject(page).searchBox.fill('shoes');

      expect((await commerceRequest).postDataJSON().clientId).toBe(clientId);
    });
  });
});
