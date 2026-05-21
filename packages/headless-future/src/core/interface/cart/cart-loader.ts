import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as cartSelectors from './cart-selectors.js';

const cartLoadedEngines = new WeakSet<FullEngine>();

export const loadCart = (engine: FullEngine) => {
  if (cartLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(cartSlice);
  const registry = getEndpointContributorRegistry(engine);

  registry.register(conversationEndpointKey, () => ({
    context: {
      cart: {
        items: engine.read(cartSelectors.items),
      },
    },
  }));

  cartLoadedEngines.add(engine);
};
