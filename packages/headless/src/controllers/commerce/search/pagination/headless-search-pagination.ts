import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
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
export function buildSearchPagination(engine: CommerceEngine): Pagination {
  if (!loadSearchPagination(engine)) {
    throw loadReducerError;
  }

  return buildCorePagination(engine, {
    fetchResultsActionCreator: executeSearch,
  });
}

function loadSearchPagination(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({commerceSearch});
  return true;
}
