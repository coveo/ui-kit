import type {Controller} from '../controller-types.js';
import type {
  Interface,
  Requires,
} from '@/src/core/interface/utils/interface-types.js';
import type {Product} from '@/src/core/interface/product-list/product-list-types.js';

export interface ProductListControllerState {
  products: Product[];
}

export interface ProductListController extends Controller {
  readonly state: ProductListControllerState;
}

export interface ProductListControllerOptions {
  interface: Interface & Requires<'search'>;
}
