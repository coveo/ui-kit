import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {queryReducer as commerceQuery} from '../../../../features/commerce/query/query-slice';
import {getCommerceQueryInitialState} from '../../../../features/commerce/query/query-state';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {loadReducerError} from '../../../../utils/errors';
import {ParameterManager} from '../../core/parameter-manager/headless-core-parameter-manager';
import {
  buildCoreParameterManager,
  ParameterManagerProps,
} from '../../core/parameter-manager/headless-core-parameter-manager';
import {
  getQ,
} from '../../../../features/parameter-manager/parameter-manager-selectors';
import {
  activeParametersSelector as coreActiveParametersSelector,
  initialParametersSelector
} from '../../../../features/commerce/parameters/parameters-selectors';
import {
  CommerceSearchParameters,
  restoreSearchParameters
} from '../../../../features/commerce/search-parameters/search-parameters-actions';
import {searchParametersDefinition} from '../../../../features/commerce/search-parameters/search-parameters-schema';

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
    fetchProductsActionCreator: executeSearch,
    enrichParameters: (state, activeParams) => ({
      q: getCommerceQueryInitialState().query!,
      ...initialParametersSelector(state),
      ...activeParams,
    }),
  });
}

function activeParametersSelector(
  state: CommerceEngine[typeof stateKey]
): CommerceSearchParameters {
  return {
    ...getQ(state?.commerceQuery, (s) => s.query, getCommerceQueryInitialState().query),
    ...coreActiveParametersSelector(state),
  };
}

function loadReducers(engine: CommerceEngine): engine is CommerceEngine {
  engine.addReducers({
    commerceQuery,
  });
  return true;
}
