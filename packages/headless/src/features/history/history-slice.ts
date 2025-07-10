import {createReducer} from '@reduxjs/toolkit';
import {undoable} from '../../app/undoable.js';
import type {SortState} from '../../controllers/sort/headless-sort.js';
import {arrayEqual} from '../../utils/compare-utils.js';
import type {AdvancedSearchQueriesState} from '../advanced-search-queries/advanced-search-queries-state.js';
import type {ContextState} from '../context/context-state.js';
import type {DictionaryFieldContextState} from '../dictionary-field-context/dictionary-field-context-state.js';
import type {AutomaticFacetSetState} from '../facets/automatic-facet-set/automatic-facet-set-state.js';
import type {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state.js';
import {findActiveValueAncestry} from '../facets/category-facet-set/category-facet-utils.js';
import type {FacetValue} from '../facets/facet-set/interfaces/response.js';
import type {AnyFacetSetState} from '../facets/generic/interfaces/generic-facet-section.js';
import type {PaginationState} from '../pagination/pagination-state.js';
import type {QueryState} from '../query/query-state.js';
import type {
  StaticFilterSetState,
  StaticFilterSlice,
} from '../static-filter-set/static-filter-set-state.js';
import type {TabSetState} from '../tab-set/tab-set-state.js';
import {redo, snapshot, undo} from './history-actions.js';
import {getHistoryInitialState, type HistoryState} from './history-state.js';

// TODO: https://coveord.atlassian.net/browse/KIT-2969:
// Should be able to remove most of the code in this file following changes history management change

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
    isDictionaryFieldContextEqual(
      current.dictionaryFieldContext,
      next.dictionaryFieldContext
    ) &&
    isAdvancedSearchQueriesEqual(
      current.advancedSearchQueries,
      next.advancedSearchQueries
    ) &&
    isTabSetEqual(current.tabSet, next.tabSet) &&
    isStaticFilterSetEqual(current.staticFilterSet, next.staticFilterSet) &&
    isFacetsEqual(current.facetSet, next.facetSet) &&
    isFacetsEqual(current.dateFacetSet, next.dateFacetSet) &&
    isFacetsEqual(current.numericFacetSet, next.numericFacetSet) &&
    isAutomaticFacetsEqual(current.automaticFacetSet, next.automaticFacetSet) &&
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

const isDictionaryFieldContextEqual = (
  current: DictionaryFieldContextState,
  next: DictionaryFieldContextState
) =>
  JSON.stringify(current.contextValues) === JSON.stringify(next.contextValues);

const isTabSetEqual = (current: TabSetState, next: TabSetState) => {
  const currentTab = findActiveTab(current);
  const nextTab = findActiveTab(next);

  return currentTab?.id === nextTab?.id;
};

const findActiveTab = (tabSet: TabSetState) => {
  return Object.values(tabSet).find((tab) => tab.isActive);
};

const isStaticFilterSetEqual = (
  current: StaticFilterSetState,
  next: StaticFilterSetState
) => {
  for (const [id, filter] of Object.entries(next)) {
    if (!current[id]) {
      return false;
    }

    const currentValues = getActiveStaticFilterValues(current[id]);
    const nextValues = getActiveStaticFilterValues(filter);

    if (JSON.stringify(currentValues) !== JSON.stringify(nextValues)) {
      return false;
    }
  }

  return true;
};

const getActiveStaticFilterValues = (filter: StaticFilterSlice) => {
  return filter.values.filter((value) => value.state !== 'idle');
};

type AnyFacetValueRequest =
  AnyFacetSetState[string]['request']['currentValues'][number];

const isFacetsEqual = (current: AnyFacetSetState, next: AnyFacetSetState) => {
  for (const [key, value] of Object.entries(next)) {
    if (!current[key]) {
      return false;
    }

    const currentSelectedValues = (
      current[key].request.currentValues as AnyFacetValueRequest[]
    ).filter((value) => value.state !== 'idle');
    const nextSelectedValues = (
      value.request.currentValues as AnyFacetValueRequest[]
    ).filter((value) => value.state !== 'idle');

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

    const currentSelectedValues = findActiveValueAncestry(
      current[key]?.request.currentValues
    ).map(({value}) => value);
    const nextSelectedValues = findActiveValueAncestry(
      value?.request.currentValues
    ).map(({value}) => value);

    if (
      JSON.stringify(currentSelectedValues) !==
      JSON.stringify(nextSelectedValues)
    ) {
      return false;
    }
  }

  return true;
};

const isAutomaticFacetsEqual = (
  current: AutomaticFacetSetState,
  next: AutomaticFacetSetState
) => {
  for (const [key, value] of Object.entries(next.set)) {
    if (!current.set[key]) {
      return false;
    }

    const currentSelectedValues = (
      current.set[key].response.values as FacetValue[]
    ).filter((value) => value.state !== 'idle');
    const nextSelectedValues = (value.response.values as FacetValue[]).filter(
      (value) => value.state !== 'idle'
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

export const history = undoable({
  actionTypes: {
    redo: redo.type,
    undo: undo.type,
    snapshot: snapshot.type,
  },
  reducer: historyReducer,
});
