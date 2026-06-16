import {getOrCreateProductListSelectors} from '@/src/core/internal/product-list/product-list-selectors.js';
import {getOrCreateProductListSlice} from '@/src/core/internal/product-list/product-list-slice.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import type {
  ProductListController,
  ProductListControllerOptions,
} from './product-list-controller-types.js';

export const buildProductListController = (
  options: ProductListControllerOptions
): ProductListController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  engine.adoptSlice(getOrCreateProductListSlice(stateId));

  const selectors = getOrCreateProductListSelectors(stateId);

  const controllerState = createMemoizedStateSelector(
    selectors.getProducts,
    (products) => ({products})
  );

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback: () => void) {
      return engine.subscribe(controllerState, callback);
    },
  };
};
