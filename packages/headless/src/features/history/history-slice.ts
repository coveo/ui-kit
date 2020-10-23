import {createReducer} from '@reduxjs/toolkit';
import {getContextInitialState, ContextState} from '../context/context-state';
import {
  getFacetSetInitialState,
  FacetSetState,
} from '../facets/facet-set/facet-set-state';
import {getQueryInitialState, QueryState} from '../query/query-state';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-state';
import {getQuerySetInitialState} from '../query-set/query-set-state';
import {
  PaginationState,
  getPaginationInitialState,
} from '../pagination/pagination-state';
import {SortState} from '../../controllers/sort/headless-sort';
import {snapshot} from './history-actions';
import {getPipelineInitialState} from '../pipeline/pipeline-state';
import {
  getDateFacetSetInitialState,
  DateFacetSetState,
} from '../facets/range-facets/date-facet-set/date-facet-set-state';
import {
  getNumericFacetSetInitialState,
  NumericFacetSetState,
} from '../facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getSearchHubInitialState} from '../search-hub/search-hub-state';
import {
  getCategoryFacetSetInitialState,
  CategoryFacetSetState,
} from '../facets/category-facet-set/category-facet-set-state';
import {
  FacetOptionsState,
  getFacetOptionsInitialState,
} from '../facet-options/facet-options-state';
import {
  AdvancedSearchQueriesState,
  getAdvancedSearchQueriesInitialState,
} from '../advanced-search-queries/advanced-search-queries-state';
import {SearchParametersState} from '../../state/search-app-state';

export const getHistoryEmptyState = (): SearchParametersState => ({
  context: getContextInitialState(),
  facetSet: getFacetSetInitialState(),
  dateFacetSet: getDateFacetSetInitialState(),
  numericFacetSet: getNumericFacetSetInitialState(),
  categoryFacetSet: getCategoryFacetSetInitialState(),
  facetOptions: getFacetOptionsInitialState(),
  pagination: getPaginationInitialState(),
  query: getQueryInitialState(),
  advancedSearchQueries: getAdvancedSearchQueriesInitialState(),
  sortCriteria: getSortCriteriaInitialState(),
  querySet: getQuerySetInitialState(),
  pipeline: getPipelineInitialState(),
  searchHub: getSearchHubInitialState(),
});

export const historyReducer = createReducer(
  getHistoryEmptyState(),
  (builder) => {
    builder.addCase(snapshot, (state, action) =>
      isEqual(state, action.payload) ? undefined : action.payload
    );
  }
);

const isEqual = (
  current: SearchParametersState,
  next: SearchParametersState
) => {
  return (
    isContextEqual(current.context, next.context) &&
    isAdvancedSearchQueriesEqual(
      current.advancedSearchQueries,
      next.advancedSearchQueries
    ) &&
    isFacetsEqual(current.facetSet, next.facetSet) &&
    isDateFacetsEqual(current.dateFacetSet, next.dateFacetSet) &&
    isNumericFacetsEqual(current.numericFacetSet, next.numericFacetSet) &&
    isCategoryFacetsEqual(current.categoryFacetSet, next.categoryFacetSet) &&
    isFacetOptionsEqual(current.facetOptions, next.facetOptions) &&
    isPaginationEqual(current.pagination, next.pagination) &&
    isQueryEqual(current.query, next.query) &&
    isSortEqual(current, next) &&
    isPipelineEqual(current.pipeline, next.pipeline) &&
    isSearchHubEqual(current.searchHub, next.searchHub)
  );
};

const isContextEqual = (current: ContextState, next: ContextState) =>
  JSON.stringify(current.contextValues) === JSON.stringify(next.contextValues);

const isFacetsEqual = (current: FacetSetState, next: FacetSetState) =>
  JSON.stringify(current) === JSON.stringify(next);

const isDateFacetsEqual = (
  current: DateFacetSetState,
  next: DateFacetSetState
) => JSON.stringify(current) === JSON.stringify(next);

const isNumericFacetsEqual = (
  current: NumericFacetSetState,
  next: NumericFacetSetState
) => JSON.stringify(current) === JSON.stringify(next);

const isCategoryFacetsEqual = (
  current: CategoryFacetSetState,
  next: CategoryFacetSetState
) => JSON.stringify(current) === JSON.stringify(next);

const isFacetOptionsEqual = (
  current: FacetOptionsState,
  next: FacetOptionsState
) => JSON.stringify(current) === JSON.stringify(next);

const isPaginationEqual = (current: PaginationState, next: PaginationState) =>
  current.firstResult === next.firstResult &&
  current.numberOfResults === next.numberOfResults;

const isQueryEqual = (current: QueryState, next: QueryState) =>
  current.q === next.q;

const isAdvancedSearchQueriesEqual = (
  current: AdvancedSearchQueriesState,
  next: AdvancedSearchQueriesState
) => JSON.stringify(current) === JSON.stringify(next);
const isSortEqual = (current: SortState, next: SortState) =>
  current.sortCriteria === next.sortCriteria;

const isPipelineEqual = (current: string, next: string) => current === next;

const isSearchHubEqual = (current: string, next: string) => current === next;
