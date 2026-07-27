import {BaseController} from '@/src/internal/utils/index.js';
import type {Supports} from '@/src/internal/utils/index.js';
import type {Product} from '@/src/internal/features/product-list/index.js';
import {getOrCreateProductListSelectors} from '@/src/internal/features/product-list/index.js';
import {getOrCreateProductListSlice} from '@/src/internal/features/product-list/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {Controller} from '../controller-types.js';

class ProductListControllerImpl extends BaseController<ProductListControllerState> {
  constructor(options: ProductListControllerOptions) {
    const {engine} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreateProductListSlice(options.interface));

    const selectors = getOrCreateProductListSelectors(options.interface);

    const controllerState = createMemoizedStateSelector(selectors.getProducts, (products) => ({
      products,
    }));

    super(engine, controllerState);
  }
}

export const buildProductListController = (
  options: ProductListControllerOptions
): ProductListController => new ProductListControllerImpl(options);

export type ProductListControllerProduct = Product;

export interface ProductListControllerState {
  products: ProductListControllerProduct[];
}

export interface ProductListController extends Controller<ProductListControllerState> {}

export interface ProductListControllerOptions {
  interface: Supports<'search'>;
}
