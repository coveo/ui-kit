import {makeHistory} from '../app/undoable.js';
import {getAdvancedSearchQueriesInitialState} from '../features/advanced-search-queries/advanced-search-queries-state.js';
import {getConfigurationInitialState} from '../features/configuration/configuration-state.js';
import {getContextInitialState} from '../features/context/context-state.js';
import {getDebugInitialState} from '../features/debug/debug-state.js';
import {getDictionaryFieldContextInitialState} from '../features/dictionary-field-context/dictionary-field-context-state.js';
import {getDidYouMeanInitialState} from '../features/did-you-mean/did-you-mean-state.js';
import {getExcerptLengthInitialState} from '../features/excerpt-length/excerpt-length-state.js';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state.js';
import {getAutomaticFacetSetInitialState} from '../features/facets/automatic-facet-set/automatic-facet-set-state.js';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state.js';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state.js';
import {getCategoryFacetSearchSetInitialState} from '../features/facets/facet-search-set/category/category-facet-search-set-state.js';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state.js';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state.js';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state.js';
import {getFieldsInitialState} from '../features/fields/fields-state.js';
import {getFoldingInitialState} from '../features/folding/folding-state.js';
import {getGeneratedAnswerInitialState} from '../features/generated-answer/generated-answer-state.js';
import {getHistoryInitialState} from '../features/history/history-state.js';
import {getInstantResultsInitialState} from '../features/instant-results/instant-results-state.js';
import {getPaginationInitialState} from '../features/pagination/pagination-state.js';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state.js';
import {getQueryInitialState} from '../features/query/query-state.js';
import {getQuerySetInitialState} from '../features/query-set/query-set-state.js';
import {getQuestionAnsweringInitialState} from '../features/question-answering/question-answering-state.js';
import {getRecentQueriesInitialState} from '../features/recent-queries/recent-queries-state.js';
import {getRecentResultsInitialState} from '../features/recent-results/recent-results-state.js';
import {getResultPreviewInitialState} from '../features/result-preview/result-preview-state.js';
import {getSearchInitialState} from '../features/search/search-state.js';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state.js';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-state.js';
import {getStandaloneSearchBoxSetInitialState} from '../features/standalone-search-box-set/standalone-search-box-set-state.js';
import {getStaticFilterSetInitialState} from '../features/static-filter-set/static-filter-set-state.js';
import {getTabSetInitialState} from '../features/tab-set/tab-set-state.js';
import {getTriggerInitialState} from '../features/triggers/triggers-state.js';
import type {SearchAppState} from '../state/search-app-state.js';

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
    automaticFacetSet: getAutomaticFacetSetInitialState(),
    generatedAnswer: getGeneratedAnswerInitialState(),
    ...config,
  };
}
