import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  executeSearch,
  fetchMoreProducts,
} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCorePagination,
  Pagination,
  PaginationProps,
} from '../../core/pagination/headless-core-commerce-pagination';
import {loadSearchReducer} from '../utils/load-search-reducers';

/**
 * Creates a `Pagination` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Pagination` controller properties.
 * @returns A `Pagination` controller instance.
 * */
export function buildSearchPagination(
  engine: CommerceEngine,
  props: PaginationProps = {}
): Pagination {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCorePagination(engine, {
    ...props,
    fetchProductsActionCreator: executeSearch,
    fetchMoreProductsActionCreator: fetchMoreProducts,
  });
}
