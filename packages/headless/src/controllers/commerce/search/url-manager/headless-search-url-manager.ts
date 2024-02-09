import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {queryReducer as commerceQuery} from '../../../../features/commerce/query/query-slice';
import {searchSerializer} from '../../../../features/commerce/search-parameters/search-parameter-serializer';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {loadReducerError} from '../../../../utils/errors';
import {
  UrlManager,
  type UrlManagerProps,
} from '../../../url-manager/headless-url-manager';
import {buildCoreUrlManager} from '../../core/url-manager/headless-core-url-manager';
import {buildSearchParameterManager} from '../parameter-manager/headless-search-parameter-manager';

/**
 * Creates a `UrlManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `UrlManager` properties.
 * @returns A `UrlManager` controller instance.
 */
export function buildSearchUrlManager(
  engine: CommerceEngine,
  props: UrlManagerProps
): UrlManager {
  if (!loadSearchUrlManagerReducers(engine)) {
    throw loadReducerError;
  }

  return buildCoreUrlManager(engine, {
    ...props,
    requestIdSelector: (state) => state.commerceSearch.requestId,
    parameterManagerBuilder: buildSearchParameterManager,
    serializer: searchSerializer,
  });
}

function loadSearchUrlManagerReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({
    commerceSearch,
    commerceQuery,
  });
  return true;
}
