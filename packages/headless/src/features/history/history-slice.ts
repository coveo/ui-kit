import {createReducer} from '@reduxjs/toolkit';
import {ContextState} from '../context/context-state';
import {FacetSetState} from '../facets/facet-set/facet-set-state';
import {QueryState} from '../query/query-state';
import {PaginationState} from '../pagination/pagination-state';
import {SortState} from '../../controllers/sort/headless-sort';
import {snapshot} from './history-actions';
import {DateFacetSetState} from '../facets/range-facets/date-facet-set/date-facet-set-state';
import {NumericFacetSetState} from '../facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {FacetOptionsState} from '../facet-options/facet-options-state';
import {AdvancedSearchQueriesState} from '../advanced-search-queries/advanced-search-queries-state';
import {getHistoryInitialState, HistoryState} from './history-state';
import {arrayEquals} from '../../utils/utils';

export const historyReducer = createReducer(
  getHistoryInitialState(),
  (builder) => {
    builder.addCase(snapshot, (state, action) =>
      isEqual(state, action.payload) ? undefined : action.payload
    );
  }
);

const isEqual = (current: HistoryState, next: HistoryState) => {
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
    isSearchHubEqual(current.searchHub, next.searchHub) &&
    isFacetOrderEqual(current.facetOrder, next.facetOrder) &&
    isDebugEqual(current.debug, next.debug)
  );
};

const isContextEqual = (current: ContextState, next: ContextState) =>
  JSON.stringify(current.contextValues) === JSON.stringify(next.contextValues);

// TODO: compare all facets non-idle values, comparing current values changes history after 1st request
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
  JSON.stringify(current) === JSON.stringify(next);

const isAdvancedSearchQueriesEqual = (
  current: AdvancedSearchQueriesState,
  next: AdvancedSearchQueriesState
) => JSON.stringify(current) === JSON.stringify(next);
const isSortEqual = (current: SortState, next: SortState) =>
  current.sortCriteria === next.sortCriteria;

const isPipelineEqual = (current: string, next: string) => current === next;

const isSearchHubEqual = (current: string, next: string) => current === next;

const isFacetOrderEqual = (current: string[], next: string[]) =>
  arrayEquals(current, next);

const isDebugEqual = (current: boolean, next: boolean) => current === next;
