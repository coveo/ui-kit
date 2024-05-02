import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {queryReducer as commerceQuery} from '../../../../features/commerce/query/query-slice';
import {getCommerceQueryInitialState} from '../../../../features/commerce/query/query-state';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {searchParametersDefinition} from '../../../../features/commerce/search-parameters/search-parameter-schema';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {CommerceSearchParametersState} from '../../../../state/commerce-app-state';
import {loadReducerError} from '../../../../utils/errors';
import {ParameterManager} from '../../core/parameter-manager/headless-core-parameter-manager';
import {
  buildCoreParameterManager,
  ParameterManagerProps,
} from '../../core/parameter-manager/headless-core-parameter-manager';

/**
 * Creates a `ParameterManager` controller instance for commerce search.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `ParameterManager` controller properties.
 * @returns A `ParameterManager` controller instance.
 */
export function buildSearchParameterManager(
  engine: CommerceEngine,
  props: ParameterManagerProps<CommerceSearchParameters>
): ParameterManager<CommerceSearchParameters> {
  if (!loadReducers(engine)) {
    throw loadReducerError;
  }

  return buildCoreParameterManager(engine, {
    ...props,
    activeParametersSelector,
    restoreActionCreator: restoreSearchParameters,
    parametersDefinition: searchParametersDefinition,
    fetchResultsActionCreator: executeSearch,
    enrichParameters: (_state, activeParams) => ({
      q: getCommerceQueryInitialState().query!,
      ...activeParams,
    }),
  });
}

function activeParametersSelector(
  state: CommerceEngine[typeof stateKey]
): CommerceSearchParameters {
  return {
    ...getQ(state),
  };
}

function getQ(state: Partial<CommerceSearchParametersState>) {
  if (state.commerceQuery === undefined) {
    return {};
  }

  const query = state.commerceQuery.query;
  const shouldInclude = query !== getCommerceQueryInitialState().query;
  return shouldInclude ? {q: query} : {};
}

function loadReducers(engine: CommerceEngine): engine is CommerceEngine {
  engine.addReducers({
    commerceQuery,
  });
  return true;
}
