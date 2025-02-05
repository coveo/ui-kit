import {RecordValue, Schema} from '@coveo/bueno';
import {CoreEngine} from '../../../app/engine.js';
import {AutomaticFacetResponse} from '../../../features/facets/automatic-facet-set/interfaces/response.js';
import {findActiveValueAncestry} from '../../../features/facets/category-facet-set/category-facet-utils.js';
import {
  BaseFacetValueRequest,
  CurrentValues,
} from '../../../features/facets/facet-api/request.js';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request.js';
import {
  getQ,
  getSortCriteria,
  getFacets,
} from '../../../features/parameter-manager/parameter-manager-selectors.js';
import {getQueryInitialState} from '../../../features/query/query-state.js';
import {
  restoreSearchParameters,
  SearchParameters,
  restoreTab,
} from '../../../features/search-parameters/search-parameter-actions.js';
import {searchParametersDefinition} from '../../../features/search-parameters/search-parameter-schema.js';
import {initialSearchParameterSelector} from '../../../features/search-parameters/search-parameter-selectors.js';
import {getSortCriteriaInitialState} from '../../../features/sort-criteria/sort-criteria-state.js';
import {SearchParametersState} from '../../../state/search-app-state.js';
import {validateInitialState} from '../../../utils/validate-payload.js';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller.js';

export type {SearchParameters};

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
  const {tab, ...parametersWithoutTab} = props.initialState.parameters;

  if (tab) {
    dispatch(restoreTab(tab));
  }
  dispatch(restoreSearchParameters(parametersWithoutTab));

  return {
    ...controller,

    synchronize(parameters: SearchParameters) {
      const {tab, ...newParamsWithoutTab} = enrichParameters(
        engine,
        parameters
      );

      if (tab) {
        dispatch(restoreTab(tab));
      }
      dispatch(restoreSearchParameters(newParamsWithoutTab));
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

export function validateParams(
  engine: CoreEngine,
  parameters: Required<SearchParameters>
): boolean {
  return validateTab(engine, parameters);
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

function getTab<Section, Value>(
  section: Section | undefined,
  tabSelector: (state: Section) => Value,
  initialState: Value
) {
  if (section === undefined) {
    return {};
  }

  const tab = tabSelector(section);
  const shouldInclude = tab !== initialState;
  return shouldInclude ? {tab} : {};
}

function validateTab(
  _engine: CoreEngine,
  _parameters: Required<SearchParameters>
) {
  return true;
}

export function getSelectedValues(request: FacetRequest) {
  return request.currentValues
    .filter((fv) => fv.state === 'selected')
    .map((fv) => fv.value);
}

export function getSelectedRangeValues(
  request: CurrentValues<BaseFacetValueRequest>
) {
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
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(af).length ? {af} : {};
}

function getSelectedResponseValues(response: AutomaticFacetResponse) {
  return response.values
    .filter((fv) => fv.state === 'selected')
    .map((fv) => fv.value);
}
