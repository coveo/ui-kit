import {Pagination} from '../../../../api/commerce/product-listings/v2/pagination';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../../app/common-reducers';
import {
  nextPage,
  selectPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as pagination} from '../../../../features/commerce/pagination/pagination-slice';
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
  state: Pagination;
}

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
    return engine.state.productListing.pagination;
  };

  const pageExists = (page: number) => {
    return page < getState().totalPages;
  };

  const hasNextPage = () => {
    return getState().page < getState().totalPages - 1;
  };

  const hasPreviousPage = () => {
    return getState().page > 0;
  };

  return {
    ...controller,

    get state() {
      return {
        ...getState(),
      };
    },

    selectPage(page: number) {
      if (pageExists(page)) {
        dispatch(selectPage(page));
        dispatch(fetchProductListing());
      } else {
        engine.logger.warn(
          `Selected page ${page} does not exist; no action was dispatched.`
        );
      }
    },

    nextPage() {
      if (hasNextPage()) {
        dispatch(nextPage());
        dispatch(fetchProductListing());
      } else {
        engine.logger.warn('There is no next page; no action was dispatched.');
      }
    },

    previousPage() {
      if (hasPreviousPage()) {
        dispatch(previousPage());
        dispatch(fetchProductListing());
      } else {
        engine.logger.warn(
          'There is no previous page; no action was dispatched.'
        );
      }
    },
  };

  function loadProductListingPaginationReducers(
    engine: CommerceEngine
  ): engine is CommerceEngine {
    engine.addReducers({
      configuration,
      productListing,
      pagination,
    });
    return true;
  }
}
