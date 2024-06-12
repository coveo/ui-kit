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
      trackingId: 'sports',
    },
    cart: {
      items: [
        {
          productId: 'SP01057_00001',
          sku: 'SP00071_00005_Small',
          quantity: 1,
          name: 'Kayaker Canoe',
          price: 800,
        },
        {
          productId: 'SP00081_00001',
          sku: 'SP00081_00001',
          quantity: 1,
          name: 'Bamboo Canoe Paddle',
          price: 120,
        },
        {
          productId: 'SP04236_00005',
          sku: 'SP04236_00005_XS',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
        {
          productId: 'SP04236_00005',
          sku: 'SP04236_00005_XS',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
      ],
    },
  },
});
