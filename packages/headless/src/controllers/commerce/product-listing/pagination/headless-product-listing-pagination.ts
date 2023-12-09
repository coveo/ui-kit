import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCorePagination,
  Pagination,
} from '../../pagination/core/headless-core-commerce-pagination';

/**
 * Creates a `Pagination` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `Pagination` controller instance.
 * */
export function buildProductListingPagination(
  engine: CommerceEngine
): Pagination {
  if (!loadProductListingPaginationReducers(engine)) {
    throw loadReducerError;
  }

  return buildCorePagination(engine, {
    fetchResultsActionCreator: fetchProductListing,
  });
}

function loadProductListingPaginationReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({productListing});
  return true;
}
