import {RecordValue, Schema} from '@coveo/bueno';
import {CoreEngine} from '../../../app/engine';
import {AutomaticFacetResponse} from '../../../features/facets/automatic-facet-set/interfaces/response';
import {findActiveValueAncestry} from '../../../features/facets/category-facet-set/category-facet-utils';
import {
  BaseFacetValueRequest,
  CurrentValues,
} from '../../../features/facets/facet-api/request';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {
  getQ,
  getSortCriteria,
  getFacets,
} from '../../../features/parameter-manager/parameter-manager-selectors';
import {getQueryInitialState} from '../../../features/query/query-state';
import {
  restoreSearchParameters,
  SearchParameters,
} from '../../../features/search-parameters/search-parameter-actions';
import {searchParametersDefinition} from '../../../features/search-parameters/search-parameter-schema';
import {initialSearchParameterSelector} from '../../../features/search-parameters/search-parameter-selectors';
import {getSortCriteriaInitialState} from '../../../features/sort-criteria/sort-criteria-state';
import {SearchParametersState} from '../../../state/search-app-state';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

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
  dispatch(restoreSearchParameters(props.initialState.parameters));

  return {
    ...controller,

    synchronize(parameters: SearchParameters) {
      const newParams = enrichParameters(engine, parameters);
      dispatch(restoreSearchParameters(newParams));
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
    ...getTab(state),
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

function getTab(state: Partial<SearchParametersState>) {
  const activeTab = Object.values(state.tabSet ?? {}).find(
    (tab) => tab.isActive
  );

  return activeTab ? {tab: activeTab.id} : {};
}

function validateTab(
  engine: CoreEngine,
  parameters: Required<SearchParameters>
) {
  const tabState = engine.state.tabSet;
  const tabParam = parameters.tab;
  if (!tabState || !Object.entries(tabState).length || !tabParam) {
    return true;
  }

  const isInState = tabParam in tabState;
  if (!isInState) {
    engine.logger.warn(
      `The tab search parameter "${tabParam}" is invalid. Ignoring change.`
    );
  }

  return isInState;
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
