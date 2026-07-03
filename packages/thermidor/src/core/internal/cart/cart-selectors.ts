import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialCartState} from './cart-slice.js';

type CartSelectors = ReturnType<typeof createCartSelectors>;

const CACHE_KEY: CacheKey<CartSelectors> =
  createCacheKey<CartSelectors>('cart/selectors');

export function createCartSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'cart',
    initialCartState
  );
  return {
    getItems: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.items
    ),
  };
}

export function getOrCreateCartSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createCartSelectors(stateId)
  );
}
