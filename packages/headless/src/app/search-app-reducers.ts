import {ReducersMapObject} from '@reduxjs/toolkit';
import {SearchAppState} from '../state/search-app-state';

import {
  configuration,
  facetSet,
  dateFacetSet,
  facetOrder,
  numericFacetSet,
  categoryFacetSet,
  facetSearchSet,
  facetOptions,
  categoryFacetSearchSet,
  query,
  advancedSearchQueries,
  querySet,
  pagination,
  redirection,
  querySuggest,
  search,
  sortCriteria,
  context,
  history,
  didYouMean,
  fields,
  pipeline,
  searchHub,
  debug,
  resultPreview,
  version,
  folding,
} from './reducers';

/**
 * Map of reducers that make up the SearchAppState.
 *
 * @deprecated - Please use `buildSearchEngine` instead of `HeadlessEngine` to instantiate an engine. The new approach configures reducers behind the scenes, so `searchAppReducers` will be removed in the next major version.
 */
export const searchAppReducers: ReducersMapObject<SearchAppState> = {
  configuration,
  facetSet,
  dateFacetSet,
  facetOrder,
  numericFacetSet,
  categoryFacetSet,
  facetSearchSet,
  facetOptions,
  categoryFacetSearchSet,
  query,
  advancedSearchQueries,
  querySet,
  pagination,
  redirection,
  querySuggest,
  search,
  sortCriteria,
  context,
  history,
  didYouMean,
  fields,
  pipeline,
  searchHub,
  debug,
  resultPreview,
  version,
  folding,
};
