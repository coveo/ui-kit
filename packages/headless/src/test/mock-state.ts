import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getQueryInitialState} from '../features/query/query-state';
import {getRedirectionInitialState} from '../features/redirection/redirection-state';
import {getQuerySetInitialState} from '../features/query-set/query-set-state';
import {getSearchInitialState} from '../features/search/search-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getContextInitialState} from '../features/context/context-state';
import {getDidYouMeanInitialState} from '../features/did-you-mean/did-you-mean-state';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getFieldsInitialState} from '../features/fields/fields-state';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state';
import {makeHistory} from '../app/undoable';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {getCategoryFacetSearchSetInitialState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {getAdvancedSearchQueriesInitialState} from '../features/advanced-search-queries/advanced-search-queries-state';
import {SearchAppState} from '../state/search-app-state';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state';
import {getHistoryInitialState} from '../features/history/history-state';
import {getDebugInitialState} from '../features/debug/debug-state';

export function createMockState(
  config: Partial<SearchAppState> = {}
): SearchAppState {
  return {
    configuration: getConfigurationInitialState(),
    advancedSearchQueries: getAdvancedSearchQueriesInitialState(),
    facetSet: getFacetSetInitialState(),
    dateFacetSet: getDateFacetSetInitialState(),
    numericFacetSet: getNumericFacetSetInitialState(),
    categoryFacetSet: getCategoryFacetSetInitialState(),
    facetSearchSet: getFacetSearchSetInitialState(),
    categoryFacetSearchSet: getCategoryFacetSearchSetInitialState(),
    facetOptions: getFacetOptionsInitialState(),
    pagination: getPaginationInitialState(),
    query: getQueryInitialState(),
    querySet: getQuerySetInitialState(),
    querySuggest: {},
    redirection: getRedirectionInitialState(),
    search: getSearchInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    context: getContextInitialState(),
    didYouMean: getDidYouMeanInitialState(),
    fields: getFieldsInitialState(),
    history: makeHistory(getHistoryInitialState()),
    pipeline: getPipelineInitialState(),
    searchHub: getSearchHubInitialState(),
    debug: getDebugInitialState(),
    ...config,
  };
}
