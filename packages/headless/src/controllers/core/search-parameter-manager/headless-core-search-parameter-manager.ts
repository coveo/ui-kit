import {isNullOrUndefined, RecordValue, Schema} from '@coveo/bueno';
import type {CoreEngine} from '../../../app/engine.js';
import {isFacetVisibleOnTab} from '../../../features/facet-options/facet-options-utils.js';
import type {AutomaticFacetResponse} from '../../../features/facets/automatic-facet-set/interfaces/response.js';
import {findActiveValueAncestry} from '../../../features/facets/category-facet-set/category-facet-utils.js';
import type {
  BaseFacetValueRequest,
  CurrentValues,
} from '../../../features/facets/facet-api/request.js';
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
  if (isNullOrUndefined(parameters.tab) || !tabSet) {
    return parameters;
  }

  if (parameters.tab === '') {
    const firstTab = Object.keys(tabSet)[0];
    return {...parameters, tab: firstTab ?? ''};
  }

  const tabExists = Object.values(tabSet).some(
    (tab) => tab.id === parameters.tab
  );

  if (!tabExists) {
    const currentActiveTab = Object.values(tabSet).find((tab) => tab.isActive);
    const firstTab = Object.keys(tabSet)[0];
    return {...parameters, tab: currentActiveTab?.id ?? firstTab ?? ''};
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
    ...getRegularFacetParams(state),
    ...getCategoryFacets(state),
    ...getNumericFacets(state),
    ...getDateFacets(state),
    ...getAutomaticFacets(state),
  };
}

function getActiveTab(state: CoreEngine['state']): string | undefined {
  const tabSet = state.tabSet;
  if (!tabSet) {
    return undefined;
  }
  const activeTab = Object.values(tabSet).find((tab) => tab.isActive);
  return activeTab?.id;
}

function facetIsEnabledAndVisibleOnTab(state: CoreEngine['state']) {
  const activeTab = getActiveTab(state);
  return (facetId: string) => {
    const facetOptions = state.facetOptions?.facets[facetId];
    const isEnabled = facetOptions?.enabled ?? true;
    const isVisibleOnTab = isFacetVisibleOnTab(facetOptions?.tabs, activeTab);
    return isEnabled && isVisibleOnTab;
  };
}

function getSelectedRangeValues(request: CurrentValues<BaseFacetValueRequest>) {
  return request.currentValues.filter((fv) => fv.state === 'selected');
}

function getRegularFacetParams(state: CoreEngine['state']) {
  const section = state.facetSet;
  if (section === undefined) {
    return {};
  }

  const isEnabled = facetIsEnabledAndVisibleOnTab(state);
  const f: Record<string, string[]> = {};
  const fExcluded: Record<string, string[]> = {};

  for (const [facetId, {request}] of Object.entries(section)) {
    if (!isEnabled(facetId)) {
      continue;
    }

    const selectedValues = request.currentValues
      .filter((fv) => fv.state === 'selected')
      .map((fv) => fv.value);
    const excludedValues = request.currentValues
      .filter((fv) => fv.state === 'excluded')
      .map((fv) => fv.value);

    if (selectedValues.length) {
      f[facetId] = selectedValues;
    }
    if (excludedValues.length) {
      fExcluded[facetId] = excludedValues;
    }
  }

  return {
    ...(Object.keys(f).length ? {f} : {}),
    ...(Object.keys(fExcluded).length ? {fExcluded} : {}),
  };
}

function getCategoryFacets(state: CoreEngine['state']) {
  return getFacets(
    state.categoryFacetSet,
    facetIsEnabledAndVisibleOnTab(state),
    (request) =>
      findActiveValueAncestry(request.currentValues).map((v) => v.value),
    'cf'
  );
}

function getNumericFacets(state: CoreEngine['state']) {
  return getFacets(
    state.numericFacetSet,
    facetIsEnabledAndVisibleOnTab(state),
    getSelectedRangeValues,
    'nf'
  );
}

function getDateFacets(state: CoreEngine['state']) {
  return getFacets(
    state.dateFacetSet,
    facetIsEnabledAndVisibleOnTab(state),
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
