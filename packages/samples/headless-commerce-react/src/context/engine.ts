import {buildCommerceEngine, CommerceEngine} from '@coveo/headless/commerce';
import {buildBrowserEnvironment} from '@coveo/relay';
import {loadCartItemsFromLocalStorage} from '../utils/cart-utils.js';

export const getEngine = () => {
  if (_engine !== null) {
    return _engine;
  }

  const organizationId = 'searchuisamples';

  _engine = buildCommerceEngine({
    navigatorContextProvider: () => ({
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      location: window.location.href,
      clientId: '59ca3c2b-a04d-56d9-b2f5-1a2bc90d84df',
    }),
    configuration: {
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      organizationId,
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

  const {storage, generateUUID, ...rest} = buildBrowserEnvironment();
  console.log(storage, generateUUID, rest);
  _engine.relay.updateConfig({
    environment: {
      ...rest,
      generateUUID: () => '59ca3c2b-a04d-56d9-b2f5-1a2bc90d84df',
    },
  });

  return _engine;
};

let _engine: CommerceEngine | null = null;
