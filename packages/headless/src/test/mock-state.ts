import {makeHistory} from '../app/undoable';
import {getAdvancedSearchQueriesInitialState} from '../features/advanced-search-queries/advanced-search-queries-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getDebugInitialState} from '../features/debug/debug-state';
import {getDictionaryFieldContextInitialState} from '../features/dictionary-field-context/dictionary-field-context-state';
import {getDidYouMeanInitialState} from '../features/did-you-mean/did-you-mean-state';
import {getExcerptLengthInitialState} from '../features/excerpt-length/excerpt-length-state';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state';
import {getCategoryFacetSearchSetInitialState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getFieldsInitialState} from '../features/fields/fields-state';
import {getFoldingInitialState} from '../features/folding/folding-state';
import {getHistoryInitialState} from '../features/history/history-state';
import {getInstantResultsInitialState} from '../features/instant-results/instant-results-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state';
import {getQuerySetInitialState} from '../features/query-set/query-set-state';
import {getQueryInitialState} from '../features/query/query-state';
import {getQuestionAnsweringInitialState} from '../features/question-answering/question-answering-state';
import {getRecentQueriesInitialState} from '../features/recent-queries/recent-queries-state';
import {getRecentResultsInitialState} from '../features/recent-results/recent-results-state';
import {getResultPreviewInitialState} from '../features/result-preview/result-preview-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {getSearchInitialState} from '../features/search/search-state';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-state';
import {getStandaloneSearchBoxSetInitialState} from '../features/standalone-search-box-set/standalone-search-box-set-state';
import {getStaticFilterSetInitialState} from '../features/static-filter-set/static-filter-set-state';
import {getTabSetInitialState} from '../features/tab-set/tab-set-state';
import {getTriggerInitialState} from '../features/triggers/triggers-state';
import {SearchAppState} from '../state/search-app-state';

/**
 * For internal use only.
 *
 * Returns a `SearchAppState` for testing purposes.
 * @param config - A Partial `SearchAppState` from which to build the target `SearchAppState`.
 * @returns The new `SearchAppState`.
 */
export function createMockState(
  config: Partial<SearchAppState> = {}
): SearchAppState {
  return {
    configuration: getConfigurationInitialState(),
    advancedSearchQueries: getAdvancedSearchQueriesInitialState(),
    staticFilterSet: getStaticFilterSetInitialState(),
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
    instantResults: getInstantResultsInitialState(),
    tabSet: getTabSetInitialState(),
    querySuggest: {},
    search: getSearchInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    context: getContextInitialState(),
    dictionaryFieldContext: getDictionaryFieldContextInitialState(),
    didYouMean: getDidYouMeanInitialState(),
    fields: getFieldsInitialState(),
    history: makeHistory(getHistoryInitialState()),
    pipeline: getPipelineInitialState(),
    facetOrder: getFacetOrderInitialState(),
    searchHub: getSearchHubInitialState(),
    debug: getDebugInitialState(),
    resultPreview: getResultPreviewInitialState(),
    version: 'unit-testing-version',
    folding: getFoldingInitialState(),
    triggers: getTriggerInitialState(),
    questionAnswering: getQuestionAnsweringInitialState(),
    standaloneSearchBoxSet: getStandaloneSearchBoxSetInitialState(),
    recentResults: getRecentResultsInitialState(),
    recentQueries: getRecentQueriesInitialState(),
    excerptLength: getExcerptLengthInitialState(),
    ...config,
  };
}
