import {RecordValue, Schema} from '@coveo/bueno';
import type {CoreEngine} from '../../../app/engine.js';
import type {AutomaticFacetResponse} from '../../../features/facets/automatic-facet-set/interfaces/response.js';
import {findActiveValueAncestry} from '../../../features/facets/category-facet-set/category-facet-utils.js';
import type {
  BaseFacetValueRequest,
  CurrentValues,
} from '../../../features/facets/facet-api/request.js';
import type {FacetRequest} from '../../../features/facets/facet-set/interfaces/request.js';
import {
  getFacets,
  getQ,
  getSortCriteria,
  getTab,
} from '../../../features/parameter-manager/parameter-manager-selectors.js';
import {getQueryInitialState} from '../../../features/query/query-state.js';
import {
  restoreSearchParameters,
  type SearchParameters,
} from '../../../features/search-parameters/search-parameter-actions.js';
import {searchParametersDefinition} from '../../../features/search-parameters/search-parameter-schema.js';
import {initialSearchParameterSelector} from '../../../features/search-parameters/search-parameter-selectors.js';
import {getSortCriteriaInitialState} from '../../../features/sort-criteria/sort-criteria-state.js';
import type {TabSetState} from '../../../features/tab-set/tab-set-state.js';
import type {SearchParametersState} from '../../../state/search-app-state.js';
import {validateInitialState} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

export interface SearchParameterManagerProps {
  /**
   * The initial state that should be applied to the `SearchParameterManager` controller.
   */
  initialState: SearchParameterManagerInitialState;
}

export interface SearchParameterManagerInitialState {
  /**
   * The parameters affecting the search response.
   */
  parameters: SearchParameters;
}

const initialStateSchema = new Schema<
  Required<SearchParameterManagerInitialState>
>({
  parameters: new RecordValue({
    options: {required: true},
    values: searchParametersDefinition,
  }),
});

/**
 * The `SearchParameterManager` controller allows restoring parameters that affect the results from e.g. a url.
 *
 * @group Controllers
 * @category SearchParameterManager
 * */
export interface SearchParameterManager extends Controller {
  /**
   * Updates the search parameters in state with the passed parameters and executes a search. Unspecified keys are reset to their initial values.
   *
   * @param parameters - The search parameters to synchronize.
   */
  synchronize(parameters: SearchParameters): void;

  /**
   * The state relevant to the `SearchParameterManager` controller.
   * */
  state: SearchParameterManagerState;
}

/**
 * A scoped and simplified part of the Headless state that is relevant to the `SearchParameterManager` controller.
 *
 * @group Controllers
 * @category SearchParameterManager
 */
export interface SearchParameterManagerState {
  /**
   * The parameters affecting the search response.
   */
  parameters: SearchParameters;
}

/**
 * Creates a `SearchParameterManager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SearchParameterManager` properties.
 * @returns A `SearchParameterManager` controller instance.
 */
export function buildCoreSearchParameterManager(
  engine: CoreEngine,
  props: SearchParameterManagerProps
): SearchParameterManager {
  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildSearchParameterManager'
  );

  const parametersWithValidTab = ensureTabIsValid(
    engine.state.tabSet,
    props.initialState.parameters
  );
  dispatch(restoreSearchParameters(parametersWithValidTab));

  return {
    ...controller,

    synchronize(parameters: SearchParameters) {
      const enrichedParametersWithValidTab = ensureTabIsValid(
        engine.state.tabSet,
        enrichParameters(engine, parameters)
      );

      dispatch(restoreSearchParameters(enrichedParametersWithValidTab));
    },
    get state() {
      const parameters = getCoreActiveSearchParameters(engine);
      return {parameters};
    },
  };
}

export function enrichParameters(
  engine: CoreEngine,
  parameters: SearchParameters
): Required<SearchParameters> {
  return {
    ...initialSearchParameterSelector(engine.state),
    ...parameters,
  };
}

/**
 * This function is essential to ensure that the `tab` parameter is valid.
 * We need it to be valid prior to dispatching the `restoreSearchParameters` action since the facet logic relies on the `tab` parameter to determine which facets to show.
 * If the `tab` parameter is invalid, it can lead to unexpected behavior in the facets.
 */
function ensureTabIsValid(
  tabSet: TabSetState | undefined,
  parameters: SearchParameters
): SearchParameters {
  if (parameters.tab && tabSet) {
    const tabExists = Object.values(tabSet).some(
      (tab) => tab.id === parameters.tab
    );
    const currentActiveTab = Object.values(tabSet).find((tab) => tab.isActive);

    if (!tabExists && currentActiveTab) {
      return {...parameters, tab: currentActiveTab.id};
    } else if (!tabExists) {
      return {...parameters, tab: ''};
    }
  }

  return parameters;
}

export function getCoreActiveSearchParameters(
  engine: CoreEngine
): SearchParameters {
  const state = engine.state;
  return {
    ...getQ(state.query, (s) => s.q, getQueryInitialState().q),
    ...getTab(
      state.tabSet,
      (tabSet) => {
        const activeTab = Object.values(tabSet ?? {}).find(
          (tab) => tab.isActive
        );
        return activeTab ? activeTab.id : Object.keys(tabSet ?? {})[0];
      },
      state.tabSet ? Object.keys(state.tabSet)[0] : ''
    ),
    ...getSortCriteria(
      state.sortCriteria,
      (sortCriteria) => sortCriteria,
      getSortCriteriaInitialState()
    ),
    ...getFacets(state.facetSet, facetIsEnabled(state), getSelectedValues, 'f'),
    ...getFacets(
      state.facetSet,
      facetIsEnabled(state),
      getExcludedValues,
      'fExcluded'
    ),
    ...getCategoryFacets(state),
    ...getNumericFacets(state),
    ...getDateFacets(state),
    ...getAutomaticFacets(state),
  };
}

function facetIsEnabled(state: CoreEngine['state']) {
  return (facetId: string) => {
    return state.facetOptions?.facets[facetId]?.enabled ?? true;
  };
}

function getSelectedValues(request: FacetRequest) {
  return request.currentValues
    .filter((fv) => fv.state === 'selected')
    .map((fv) => fv.value);
}

function getSelectedRangeValues(request: CurrentValues<BaseFacetValueRequest>) {
  return request.currentValues.filter((fv) => fv.state === 'selected');
}

function getExcludedValues(request: FacetRequest) {
  return request.currentValues
    .filter((fv) => fv.state === 'excluded')
    .map((fv) => fv.value);
}

function getCategoryFacets(state: CoreEngine['state']) {
  return getFacets(
    state.categoryFacetSet,
    facetIsEnabled(state),
    (request) =>
      findActiveValueAncestry(request.currentValues).map((v) => v.value),
    'cf'
  );
}

function getNumericFacets(state: CoreEngine['state']) {
  return getFacets(
    state.numericFacetSet,
    facetIsEnabled(state),
    getSelectedRangeValues,
    'nf'
  );
}

function getDateFacets(state: CoreEngine['state']) {
  return getFacets(
    state.dateFacetSet,
    facetIsEnabled(state),
    getSelectedRangeValues,
    'df'
  );
}

function getAutomaticFacets(state: Partial<SearchParametersState>) {
  const set = state.automaticFacetSet?.set;
  if (set === undefined) {
    return {};
  }
  const af = Object.entries(set)
    .map(([facetId, {response}]) => {
      const selectedValues = getSelectedResponseValues(response);
      return selectedValues.length ? {[facetId]: selectedValues} : {};
    })
    // biome-ignore lint/performance/noAccumulatingSpread: <>
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(af).length ? {af} : {};
}

function getSelectedResponseValues(response: AutomaticFacetResponse) {
  return response.values
    .filter((fv) => fv.state === 'selected')
    .map((fv) => fv.value);
}
