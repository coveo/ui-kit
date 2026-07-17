import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
import {initialProductListState} from './product-list-slice.js';
import type {Product} from './product-list-types.js';

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
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createProductListSelectors(stateId)
  );
}
