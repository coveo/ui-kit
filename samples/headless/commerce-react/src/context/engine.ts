import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
  type CommerceEngine,
} from '@coveo/headless/commerce';
import {loadCartItemsFromLocalStorage} from '../utils/cart-utils.js';

export const getEngine = () => {
  if (_engine !== null) {
    return _engine;
  }

  const sampleConfiguration = getSampleCommerceEngineConfiguration();

  _engine = buildCommerceEngine({
    configuration: {
      ...sampleConfiguration,
      cart: {
        items:
          loadCartItemsFromLocalStorage() ??
          sampleConfiguration.cart?.items ??
          [],
      },
    },
  });

  return _engine;
};

let _engine: CommerceEngine | null = null;
