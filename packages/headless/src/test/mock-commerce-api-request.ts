import type {
  BaseCommerceAPIRequest,
  PaginatedCommerceAPIRequest,
} from '../api/commerce/common/request.js';

export const buildMockBaseCommerceAPIRequest = (
  config?: Partial<BaseCommerceAPIRequest>
): BaseCommerceAPIRequest => {
  return {
    accessToken: 'mock-access-token',
    url: 'https://mock-url.com/rest/commerce',
    organizationId: 'mock-organization-id',
    trackingId: 'mock-tracking-id',
    language: 'en',
    country: 'CA',
    currency: 'CAD',
    context: {
      user: {
        latitude: 46.767531,
        longitude: -71.3096,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      },
      view: {
        url: 'https://mock-url.com/some-listing-page',
        referrer: 'https://mock-referrer.com',
      },
      capture: true,
      cart: [{productId: 'mock-product-id-1', quantity: 1}],
      source: ['@coveo/headless@mock-version'],
      ...config,
    },
  };
};

export const buildMockPaginatedCommerceAPIRequest = (
  config?: Partial<PaginatedCommerceAPIRequest>
): PaginatedCommerceAPIRequest => {
  return {
    ...buildMockBaseCommerceAPIRequest(config),
    page: 0,
    perPage: 10,
    ...config,
  };
};
