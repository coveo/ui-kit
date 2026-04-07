import {buildCommerceEngine} from '@coveo/headless/commerce';

export const engine = buildCommerceEngine({
  configuration: {
    accessToken: 'your-access-token',
    organizationId: 'your-org-id',
    analytics: {
      trackingId: 'your-tracking-id',
    },
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://my-store.example.com',
      },
      custom: {
        shoppingIntent: 'fishing',
        storeId: '10010',
        fitmentProducts: ['SP-00301', 'SP-01202'],
      },
    },
  },
});
