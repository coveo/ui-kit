import {
  buildCommerceEngine,
  CommerceEngine,
  getOrganizationEndpoints,
} from '@coveo/headless/commerce';
import {loadCartItemsFromLocalStorage} from '../utils/cart-utils';

export const getEngine = () => {
  if (_engine !== null) {
    return _engine;
  }

  const organizationId = 'searchuisamples';

  _engine = buildCommerceEngine({
    configuration: {
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      organizationId,
      organizationEndpoints: getOrganizationEndpoints(organizationId),
      analytics: {
        trackingId: 'sports-ui-samples',
      },
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {
          url: 'https://sports.barca.group',
        },
      },
      cart: {
        items: loadCartItemsFromLocalStorage() ?? [],
      },
    },
  });

  return _engine;
};

let _engine: CommerceEngine | null = null;
