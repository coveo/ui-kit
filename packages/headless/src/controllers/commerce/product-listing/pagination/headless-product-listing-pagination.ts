import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCorePagination,
  Pagination,
  PaginationProps,
} from '../../core/pagination/headless-core-commerce-pagination';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

/**
 * Creates a `Pagination` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Pagination` controller properties.
 * @returns A `Pagination` controller instance.
 * */
export function buildProductListingPagination(
  engine: CommerceEngine,
  props: PaginationProps = {}
): Pagination {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCorePagination(engine, {
    ...props,
    fetchResultsActionCreator: fetchProductListing,
  });
}
