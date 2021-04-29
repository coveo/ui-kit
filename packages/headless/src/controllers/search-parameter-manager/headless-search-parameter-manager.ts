import {RecordValue, Schema} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {partitionIntoParentsAndValues} from '../../features/facets/category-facet-set/category-facet-utils';
import {FacetValueRequest} from '../../features/facets/facet-set/interfaces/request';
import {getDebugInitialState} from '../../features/debug/debug-state';
import {getPaginationInitialState} from '../../features/pagination/pagination-state';
import {getQueryInitialState} from '../../features/query/query-state';
import {
  restoreSearchParameters,
  SearchParameters,
} from '../../features/search-parameters/search-parameter-actions';
import {searchParametersDefinition} from '../../features/search-parameters/search-parameter-schema';
import {getSortCriteriaInitialState} from '../../features/sort-criteria/sort-criteria-state';
import {SearchParametersState} from '../../state/search-app-state';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';
import {RangeValueRequest} from '../../features/facets/range-facets/generic/interfaces/range-facet';

export {SearchParameters};

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
export function buildSearchParameterManager(
  engine: Engine<object>,
  props: SearchParameterManagerProps
): SearchParameterManager {
  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildSearchParameterManager'
  );
  dispatch(restoreSearchParameters(props.initialState.parameters));

  return {
    ...controller,

    get state() {
      const state = getState();
      const parameters: SearchParameters = {
        ...getQ(state),
        ...getEnableQuerySyntax(state),
        ...getAq(state),
        ...getCq(state),
        ...getFirstResult(state),
        ...getNumberOfResults(state),
        ...getSortCriteria(state),
        ...getFacets(state),
        ...getCategoryFacets(state),
        ...getNumericFacets(state),
        ...getDateFacets(state),
        ...getDebug(state),
      };

      return {parameters};
    },
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

function getEnableQuerySyntax(state: Partial<SearchParametersState>) {
  if (state.query === undefined) {
    return {};
  }

  const enableQuerySyntax = state.query.enableQuerySyntax;
  const shouldInclude =
    enableQuerySyntax !== getQueryInitialState().enableQuerySyntax;
  return shouldInclude ? {enableQuerySyntax} : {};
}

function getAq(state: Partial<SearchParametersState>) {
  if (state.advancedSearchQueries === undefined) {
    return {};
  }

  const {aq, defaultFilters} = state.advancedSearchQueries;
  const shouldInclude = aq !== defaultFilters.aq;
  return shouldInclude ? {aq} : {};
}

function getCq(state: Partial<SearchParametersState>) {
  if (state.advancedSearchQueries === undefined) {
    return {};
  }

  const {cq, defaultFilters} = state.advancedSearchQueries;
  const shouldInclude = cq !== defaultFilters.cq;
  return shouldInclude ? {cq} : {};
}

function getFirstResult(state: Partial<SearchParametersState>) {
  if (state.pagination === undefined) {
    return {};
  }

  const firstResult = state.pagination.firstResult;
  const shouldInclude = firstResult !== getPaginationInitialState().firstResult;
  return shouldInclude ? {firstResult} : {};
}

function getNumberOfResults(state: Partial<SearchParametersState>) {
  if (state.pagination === undefined) {
    return {};
  }

  const numberOfResults = state.pagination.numberOfResults;
  const shouldInclude =
    numberOfResults !== getPaginationInitialState().numberOfResults;
  return shouldInclude ? {numberOfResults} : {};
}

function getSortCriteria(state: Partial<SearchParametersState>) {
  if (state.sortCriteria === undefined) {
    return {};
  }

  const sortCriteria = state.sortCriteria;
  const shouldInclude = sortCriteria !== getSortCriteriaInitialState();
  return shouldInclude ? {sortCriteria} : {};
}

function getFacets(state: Partial<SearchParametersState>) {
  if (state.facetSet === undefined) {
    return {};
  }

  const f = Object.entries(state.facetSet)
    .map(([facetId, request]) => {
      const selectedValues = getSelectedValues(request.currentValues);
      return selectedValues.length ? {[facetId]: selectedValues} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(f).length ? {f} : {};
}

function getSelectedValues(values: FacetValueRequest[]) {
  return values.filter((fv) => fv.state === 'selected').map((fv) => fv.value);
}

function getCategoryFacets(state: Partial<SearchParametersState>) {
  if (state.categoryFacetSet === undefined) {
    return {};
  }

  const cf = Object.entries(state.categoryFacetSet)
    .map(([facetId, slice]) => {
      const {parents} = partitionIntoParentsAndValues(
        slice!.request.currentValues
      );
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
    .map(([facetId, request]) => {
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
    .map(([facetId, request]) => {
      const selectedRanges = getSelectedRanges(request.currentValues);
      return selectedRanges.length ? {[facetId]: selectedRanges} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(df).length ? {df} : {};
}

function getSelectedRanges<T extends RangeValueRequest>(ranges: T[]) {
  return ranges.filter((range) => range.state === 'selected');
}

function getDebug(state: Partial<SearchParametersState>) {
  if (state.debug === undefined) {
    return {};
  }

  const debug = state.debug;
  const shouldInclude = debug !== getDebugInitialState();
  return shouldInclude ? {debug} : {};
}
