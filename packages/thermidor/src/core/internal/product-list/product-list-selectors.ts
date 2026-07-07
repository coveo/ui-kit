import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialProductListState} from './product-list-slice.js';
import type {Product} from '@/src/core/interface/product-list/product-list-types.js';

type ProductListSelectors = ReturnType<typeof createProductListSelectors>;

const CACHE_KEY: CacheKey<ProductListSelectors> =
  createCacheKey<ProductListSelectors>('productList/selectors');

export function createProductListSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'products',
    initialProductListState
  );

  return {
    getProducts: createMemoizedStateSelector(
      sliceSelector,
      (state): Product[] => state.products
    ),
  };
}

export function getOrCreateProductListSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createProductListSelectors(stateId)
  );
}
