import {ReducersMapObject} from '@reduxjs/toolkit';
import {SearchAppState} from '../state/search-app-state';
import {queryReducer} from '../features/query/query-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {redirectionReducer} from '../features/redirection/redirection-slice';
import {querySuggestReducer} from '../features/query-suggest/query-suggest-slice';
import {querySetReducer} from '../features/query-set/query-set-slice';
import {searchReducer} from '../features/search/search-slice';
import {paginationReducer} from '../features/pagination/pagination-slice';
import {sortCriteriaReducer} from '../features/sort-criteria/sort-criteria-slice';
import {facetSetReducer} from '../features/facets/facet-set/facet-set-slice';
import {contextReducer} from '../features/context/context-slice';
import {undoable} from './undoable';
import {historyReducer} from '../features/history/history-slice';
import {didYouMeanReducer} from '../features/did-you-mean/did-you-mean-slice';
import {specificFacetSearchSetReducer} from '../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {fieldsReducer} from '../features/fields/fields-slice';
import {pipelineReducer} from '../features/pipeline/pipeline-slice';
import {dateFacetSetReducer} from '../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {numericFacetSetReducer} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {searchHubReducer} from '../features/search-hub/search-hub-slice';
import {categoryFacetSetReducer} from '../features/facets/category-facet-set/category-facet-set-slice';
import {categoryFacetSearchSetReducer} from '../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {facetOptionsReducer} from '../features/facet-options/facet-options-slice';
import {advancedSearchQueriesReducer} from '../features/advanced-search-queries/advanced-search-queries-slice';
import {getHistoryInitialState} from '../features/history/history-state';
import {debugReducer} from '../features/debug/debug-slice';

/**
 * Map of reducers that make up the SearchAppState.
 */
export const searchAppReducers: ReducersMapObject<SearchAppState> = {
  configuration: configurationReducer,
  facetSet: facetSetReducer,
  dateFacetSet: dateFacetSetReducer,
  numericFacetSet: numericFacetSetReducer,
  categoryFacetSet: categoryFacetSetReducer,
  facetSearchSet: specificFacetSearchSetReducer,
  facetOptions: facetOptionsReducer,
  categoryFacetSearchSet: categoryFacetSearchSetReducer,
  query: queryReducer,
  advancedSearchQueries: advancedSearchQueriesReducer,
  querySet: querySetReducer,
  pagination: paginationReducer,
  redirection: redirectionReducer,
  querySuggest: querySuggestReducer,
  search: searchReducer,
  sortCriteria: sortCriteriaReducer,
  context: contextReducer,
  history: undoable(historyReducer, getHistoryInitialState()),
  didYouMean: didYouMeanReducer,
  fields: fieldsReducer,
  pipeline: pipelineReducer,
  searchHub: searchHubReducer,
  debug: debugReducer,
};
