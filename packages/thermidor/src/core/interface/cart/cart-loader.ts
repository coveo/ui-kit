import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
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
  loadedIds.add(interfaceId);
};
