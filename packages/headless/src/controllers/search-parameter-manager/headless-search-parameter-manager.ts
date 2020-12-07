import {RecordValue, Schema} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {getAdvancedSearchQueriesInitialState} from '../../features/advanced-search-queries/advanced-search-queries-state';
import {partitionIntoParentsAndValues} from '../../features/facets/category-facet-set/category-facet-utils';
import {FacetValueRequest} from '../../features/facets/facet-set/interfaces/request';
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
import {buildController} from '../controller/headless-controller';

export interface SearchParameterManagerProps {
  initialState: SearchParameterManagerInitialState;
}

interface SearchParameterManagerInitialState {
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

/** The `SearchParameterManager` controller allows restoring parameters that affect the results from e.g. a url.*/
export type SearchParameterManager = ReturnType<
  typeof buildSearchParameterManager
>;

/** The state relevant to the `SearchParameterManager` controller.*/
export type SearchParameterManagerState = SearchParameterManager['state'];

export function buildSearchParameterManager(
  engine: Engine<Partial<SearchParametersState>>,
  props: SearchParameterManagerProps
) {
  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    initialStateSchema,
    props.initialState,
    buildSearchParameterManager.name
  );
  dispatch(restoreSearchParameters(props.initialState.parameters));

  return {
    ...controller,

    get state() {
      const state = engine.state;
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

  const aq = state.advancedSearchQueries.aq;
  const shouldInclude = aq !== getAdvancedSearchQueriesInitialState().aq;
  return shouldInclude ? {aq} : {};
}

function getCq(state: Partial<SearchParametersState>) {
  if (state.advancedSearchQueries === undefined) {
    return {};
  }

  const cq = state.advancedSearchQueries.cq;
  const shouldInclude = cq !== getAdvancedSearchQueriesInitialState().cq;
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
    .map(([facetId, request]) => {
      const {parents} = partitionIntoParentsAndValues(request.currentValues);
      const selectedValues = parents.map((p) => p.value);

      return selectedValues.length ? {[facetId]: selectedValues} : {};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(cf).length ? {cf} : {};
}
