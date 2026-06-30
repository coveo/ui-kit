import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialProductListState} from './product-list-slice.js';
import type {Product} from '@/src/core/interface/product-list/product-list-types.js';

function createProductListSelectors(interfaceId: string) {
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

const selectorsCache = new Map<
  string,
  ReturnType<typeof createProductListSelectors>
>();

export function getOrCreateProductListSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createProductListSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
