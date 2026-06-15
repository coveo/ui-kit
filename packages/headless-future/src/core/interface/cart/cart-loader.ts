import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {getOrCreateCartSelectors} from '@/src/core/internal/cart/cart-selectors.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

const cartLoadedKeys = new WeakMap<FullEngine, Set<string>>();

export const loadCart = (engine: FullEngine, interfaceId: string) => {
  if (!cartLoadedKeys.has(engine)) {
    cartLoadedKeys.set(engine, new Set());
  }

  const loadedIds = cartLoadedKeys.get(engine)!;
  if (loadedIds.has(interfaceId)) {
    return;
  }

  engine.adoptSlice(getOrCreateCartSlice(interfaceId));

  const selectors = getOrCreateCartSelectors(interfaceId);
  const registry = getEndpointContributorRegistry(engine);

  registry.register(conversationEndpointKey, () => ({
    context: {
      cart: engine.read(selectors.getItems),
    },
  }));

  loadedIds.add(interfaceId);
};
