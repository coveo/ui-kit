import {SearchParametersState} from '../../search-parameters-state';
import {createReducer} from '@reduxjs/toolkit';
import {getContextInitialState, ContextState} from '../context/context-slice';
import {
  getFacetSetInitialState,
  FacetSetState,
} from '../facets/facet-set/facet-set-slice';
import {getQueryInitialState} from '../query/query-slice';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-slice';
import {getQuerySetInitialState} from '../query-set/query-set-slice';
import {
  PaginationState,
  getPaginationInitialState,
} from '../pagination/pagination-slice';
import {QueryState} from '../../state';
import {SortState} from '../../controllers/sort/headless-sort';
import {snapshot} from './history-actions';
import {
  getRangeFacetSetInitialState,
  RangeFacetSetState,
} from '../facets/range-facet-set/range-facet-set-slice';
import {getPipelineInitialState} from '../pipeline/pipeline-slice';
import {getSearchHubInitialState} from '../search-hub/search-hub-slice';

export const getHistoryEmptyState = (): SearchParametersState => ({
  context: getContextInitialState(),
  facetSet: getFacetSetInitialState(),
  rangeFacetSet: getRangeFacetSetInitialState(),
  pagination: getPaginationInitialState(),
  query: getQueryInitialState(),
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
    isFacetsEqual(current.facetSet, next.facetSet) &&
    isRangeFacetsEqual(current.rangeFacetSet, next.rangeFacetSet) &&
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

const isRangeFacetsEqual = (
  current: RangeFacetSetState,
  next: RangeFacetSetState
) => JSON.stringify(current) === JSON.stringify(next);

const isPaginationEqual = (current: PaginationState, next: PaginationState) =>
  current.firstResult === next.firstResult &&
  current.numberOfResults === next.numberOfResults;

const isQueryEqual = (current: QueryState, next: QueryState) =>
  current.q === next.q;

const isSortEqual = (current: SortState, next: SortState) =>
  current.sortCriteria === next.sortCriteria;

const isPipelineEqual = (current: string, next: string) => current === next;

const isSearchHubEqual = (current: string, next: string) => current === next;
