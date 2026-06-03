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
});
