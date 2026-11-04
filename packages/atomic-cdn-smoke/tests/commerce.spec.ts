import {test, commerceApi} from '../fixtures.js';

test('Commerce page renders products', async ({renderPage}) => {
  await renderPage({
    page: 'commerce.html',
    handlers: commerceApi.handlers,
    interfaceTag: 'atomic-commerce-interface',
    initializeOptions: {
      accessToken: 'test-token',
      organizationId: 'testorg',
      analytics: {trackingId: 'smoke-test'},
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {url: 'https://example.com'},
      },
    },
    firstRequest: 'executeFirstRequest',
    itemSelector: 'atomic-commerce-product-list atomic-product',
  });
});
