import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
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
