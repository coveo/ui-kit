import {buildCommerceEngine} from '@coveo/headless/commerce';
import {loadCartItemsFromLocalStorage} from './cart-utils.js';

export const engine = buildCommerceEngine({
  configuration: {
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
    analytics: {trackingId: 'sports-ui-samples'},
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {url: 'https://sports.barca.group'},
    },
    // Restore the cart saved on the previous visit (see cart-utils.js).
    cart: {
      items: loadCartItemsFromLocalStorage() ?? [],
    },
  },
});
