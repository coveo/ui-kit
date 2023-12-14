import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  Sort,
  buildCoreSort,
  SortProps,
} from '../../sort/core/headless-core-commerce-sort';
import {loadSearchReducer} from '../utils/load-search-reducers';

/**
 * Creates a `Sort` controller instance for commerce search.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSearchSort(
  engine: CommerceEngine,
  props: SortProps = {}
): Sort {
  if (!loadSearchReducer(engine)) {
    throw loadReducerError;
  }

  return buildCoreSort(engine, {
    ...props,
    fetchResultsActionCreator: executeSearch,
  });
}
