import {navContent} from './commerce-nav.mjs';
import {getOrganizationEndpoints} from '/build/headless/commerce/headless.esm.js';

export const commerceEngineConfig = {
  accessToken: 'xxc481d5de-16cb-4290-bd78-45345319d94c',
  organizationId: 'barcasportsmcy01fvu',
  organizationEndpoints: await getOrganizationEndpoints(
    'barcasportsmcy01fvu',
    'dev'
  ),
  analytics: {
    trackingId: 'sports',
  },
  context: {
    language: 'en',
    country: 'US',
    currency: 'USD',
    view: {
      url: navContent[document.title].barcaUrl,
      referrer: document.referrer,
    },
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
};
