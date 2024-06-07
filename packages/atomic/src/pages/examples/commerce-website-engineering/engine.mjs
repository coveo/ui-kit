import {navContent} from './commerce-nav.mjs';
import {buildCommerceEngine} from '/build/headless/commerce/headless.esm.js';

export const commerceEngine = buildCommerceEngine({
  configuration: {
    accessToken: 'xxc481d5de-16cb-4290-bd78-45345319d94c',
    context: {
      country: 'US',
      currency: 'USD',
      language: 'en',
      view: {
        url: navContent[document.title].barcaUrl,
        referrer: document.referrer,
      },
    },
    organizationId: 'barcasportsmcy01fvu',
    environment: 'dev',
    analytics: {
      trackingId: 'engineering',
    },
    cart: {
      items: [
        {
          productId: 'BE03621',
          sku: 'BE03621_03647',
          quantity: 1,
          name: 'GarminMCB',
          price: 600,
        },
      ],
    },
  },
});
