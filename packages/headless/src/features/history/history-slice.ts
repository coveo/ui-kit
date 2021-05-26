import {createReducer} from '@reduxjs/toolkit';
import {ContextState} from '../context/context-state';
import {QueryState} from '../query/query-state';
import {PaginationState} from '../pagination/pagination-state';
import {SortState} from '../../controllers/sort/headless-sort';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {AdvancedSearchQueriesState} from '../advanced-search-queries/advanced-search-queries-state';
import {partitionIntoParentsAndValues} from '../facets/category-facet-set/category-facet-utils';
import {getHistoryInitialState, HistoryState} from './history-state';
import {snapshot} from './history-actions';
import {
  BaseFacetValueRequest,
  CurrentValues,
} from '../facets/facet-api/request';
import {arrayEqual} from '../../utils/compare-utils';

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
    isFacetsEqual(current.dateFacetSet, next.dateFacetSet) &&
    isFacetsEqual(current.numericFacetSet, next.numericFacetSet) &&
    isCategoryFacetsEqual(current.categoryFacetSet, next.categoryFacetSet) &&
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

type FacetStateWithCurrentValues = Record<
  string,
  CurrentValues<BaseFacetValueRequest>
>;

const isFacetsEqual = (
  current: FacetStateWithCurrentValues,
  next: FacetStateWithCurrentValues
) => {
  for (const [key, value] of Object.entries(next)) {
    if (!current[key]) {
      return false;
    }

    const currentSelectedValues = current[key].currentValues.filter(
      (value) => value.state === 'selected'
    );
    const nextSelectedValues = value.currentValues.filter(
      (value) => value.state === 'selected'
    );

    if (
      JSON.stringify(currentSelectedValues) !==
      JSON.stringify(nextSelectedValues)
    ) {
      return false;
    }
  }

  return true;
};

const isCategoryFacetsEqual = (
  current: CategoryFacetSetState,
  next: CategoryFacetSetState
) => {
  for (const [key, value] of Object.entries(next)) {
    if (!current[key]) {
      return false;
    }

    const currentSelectedValues = partitionIntoParentsAndValues(
      current[key]?.request.currentValues
    ).parents.map(({value}) => value);
    const nextSelectedValues = partitionIntoParentsAndValues(
      value?.request.currentValues
    ).parents.map(({value}) => value);

    if (
      JSON.stringify(currentSelectedValues) !==
      JSON.stringify(nextSelectedValues)
    ) {
      return false;
    }
  }

  return true;
};

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
  arrayEqual(current, next);

const isDebugEqual = (current: boolean, next: boolean) => current === next;
