import type {Controller} from '../controller-types.js';
import type {Requires} from '@/src/core/interface/utils/interface-types.js';
import type {Product} from '@/src/core/interface/product-list/product-list-types.js';
import {getOrCreateProductListSelectors} from '@/src/core/internal/product-list/product-list-selectors.js';
import {getOrCreateProductListSlice} from '@/src/core/internal/product-list/product-list-slice.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';

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
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
  };
};

export type ProductListControllerProduct = Product;

export interface ProductListControllerState {
  products: ProductListControllerProduct[];
}

export interface ProductListController extends Controller<ProductListControllerState> {}

export interface ProductListControllerOptions {
  interface: Requires<'search'>;
}
