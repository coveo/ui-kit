import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCorePagination,
  Pagination,
} from '../../core/pagination/headless-core-commerce-pagination';
import {loadSearchReducer} from '../utils/load-search-reducers';

/**
 * Creates a `Pagination` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `Pagination` controller instance.
 * */
export function buildSearchPagination(engine: CommerceEngine): Pagination {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCorePagination(engine, {
    fetchResultsActionCreator: executeSearch,
  });
}
