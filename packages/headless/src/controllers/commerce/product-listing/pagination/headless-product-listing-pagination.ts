import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  nextPage,
  selectPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {loadReducerError} from '../../../../utils/errors';
import {
  Controller,
  buildController,
} from '../../../controller/headless-controller';

/**
 * The `ProductListingPagination` controller is responsible for navigating between pages of results in a commerce product listing interface.
 */
export interface ProductListingPagination extends Controller {
  /**
   * Navigates to a specific page.
   *
   * @param page The page to navigate to.
   */
  selectPage(page: number): void;

  /**
   * Navigates to the next page.
   */
  nextPage(): void;

  /**
   * Navigates to the previous page.
   */
  previousPage(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `ProductListingPagination` controller.
   */
  state: ProductListingPaginationState;
}

export interface ProductListingPaginationState {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export type ProductListingPaginationControllerState =
  ProductListingPagination['state'];

/**
 * Creates a `ProductListingPagination` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductListingPagination` controller instance.
 * */
export function buildProductListingPagination(
  engine: CommerceEngine
): ProductListingPagination {
  if (!loadProductListingPaginationReducers(engine)) {
    throw loadReducerError;
  }
  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => {
    return engine.state.commercePagination!;
  };

  return {
    ...controller,

    get state() {
      return getState();
    },

    selectPage(page: number) {
      dispatch(selectPage(page));
      dispatch(fetchProductListing());
    },

    nextPage() {
      dispatch(nextPage());
      dispatch(fetchProductListing());
    },

    previousPage() {
      dispatch(previousPage());
      dispatch(fetchProductListing());
    },
  };

  function loadProductListingPaginationReducers(
    engine: CommerceEngine
  ): engine is CommerceEngine {
    engine.addReducers({
      productListing,
      commercePagination,
    });
    return true;
  }
}
