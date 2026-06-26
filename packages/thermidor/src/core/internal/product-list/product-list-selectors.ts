import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {initialProductListState} from './product-list-slice.js';
import type {Product} from '@/src/core/interface/product-list/product-list-types.js';

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

export const getOrCreateProductListSelectors = SingletonFactory(
  createProductListSelectors
);
