import {RecordValue, Schema} from '@coveo/bueno';
import {CoreEngine} from '../../../app/engine';
import {findActiveValueAncestry} from '../../../features/facets/category-facet-set/category-facet-utils';
import {FacetValueRequest} from '../../../features/facets/facet-set/interfaces/request';
import {RangeValueRequest} from '../../../features/facets/range-facets/generic/interfaces/range-facet';
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
    ...getQ(state),
    ...getTab(state),
    ...getSortCriteria(state),
    ...getFacets(state, getSelectedValues, 'f'),
    ...getFacets(state, getExcludedValues, 'fExcluded'),
    ...getCategoryFacets(state),
    ...getNumericFacets(state),
    ...getDateFacets(state),
    ...getAutomaticFacets(state),
  };
}

function getQ(state: Partial<SearchParametersState>) {
  if (state.query === undefined) {
    return {};
  }

  const q = state.query.q;
  const shouldInclude = q !== getQueryInitialState().q;
  return shouldInclude ? {q} : {};
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

function getSortCriteria(state: Partial<SearchParametersState>) {
  if (state.sortCriteria === undefined) {
    return {};
  }

  const sortCriteria = state.sortCriteria;
  const shouldInclude = sortCriteria !== getSortCriteriaInitialState();
  return shouldInclude ? {sortCriteria} : {};
}

function getFacets(
  state: Partial<SearchParametersState>,
  valuesSelector: (currentValues: FacetValueRequest[]) => string[],
  out: keyof SearchParameters
) {
  if (state.facetSet === undefined) {
    return {};
  }

  const facets = Object.entries(state.facetSet)
    .filter(([facetId]) => state.facetOptions?.facets[facetId]?.enabled ?? true)
    .map(([facetId, {request}]) => {
      const facetValues = valuesSelector(request.currentValues);
      return facetValues.length ? {[facetId]: facetValues} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(facets).length ? {[out]: facets} : {};
}

function getSelectedValues(values: FacetValueRequest[]) {
  return values.filter((fv) => fv.state === 'selected').map((fv) => fv.value);
}

function getExcludedValues(values: FacetValueRequest[]) {
  return values.filter((fv) => fv.state === 'excluded').map((fv) => fv.value);
}

function getCategoryFacets(state: Partial<SearchParametersState>) {
  if (state.categoryFacetSet === undefined) {
    return {};
  }

  const cf = Object.entries(state.categoryFacetSet)
    .filter(([facetId]) => state.facetOptions?.facets[facetId]?.enabled ?? true)
    .map(([facetId, slice]) => {
      const parents = findActiveValueAncestry(slice.request.currentValues);
      const selectedValues = parents.map((p) => p.value);

      return selectedValues.length ? {[facetId]: selectedValues} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(cf).length ? {cf} : {};
}

function getNumericFacets(state: Partial<SearchParametersState>) {
  if (state.numericFacetSet === undefined) {
    return {};
  }

  const nf = Object.entries(state.numericFacetSet)
    .filter(([facetId]) => state.facetOptions?.facets[facetId]?.enabled ?? true)
    .map(([facetId, {request}]) => {
      const selectedRanges = getSelectedRanges(request.currentValues);
      return selectedRanges.length ? {[facetId]: selectedRanges} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(nf).length ? {nf} : {};
}

function getDateFacets(state: Partial<SearchParametersState>) {
  if (state.dateFacetSet === undefined) {
    return {};
  }

  const df = Object.entries(state.dateFacetSet)
    .filter(([facetId]) => state.facetOptions?.facets[facetId]?.enabled ?? true)
    .map(([facetId, {request}]) => {
      const selectedRanges = getSelectedRanges(request.currentValues);
      return selectedRanges.length ? {[facetId]: selectedRanges} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(df).length ? {df} : {};
}

function getSelectedRanges<T extends RangeValueRequest>(ranges: T[]) {
  return ranges.filter((range) => range.state === 'selected');
}

function getAutomaticFacets(state: Partial<SearchParametersState>) {
  const set = state.automaticFacetSet?.set;
  if (set === undefined) {
    return {};
  }
  const af = Object.entries(set)
    .map(([facetId, {response}]) => {
      const selectedValues = getSelectedValues(response.values);
      return selectedValues.length ? {[facetId]: selectedValues} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(af).length ? {af} : {};
}
