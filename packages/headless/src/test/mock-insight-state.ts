import {getAttachedResultsInitialState} from '../features/attached-results/attached-results-state.js';
import {getCaseContextInitialState} from '../features/case-context/case-context-state.js';
import {getConfigurationInitialState} from '../features/configuration/configuration-state.js';
import {getContextInitialState} from '../features/context/context-state.js';
import {getDidYouMeanInitialState} from '../features/did-you-mean/did-you-mean-state.js';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state.js';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state.js';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state.js';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state.js';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state.js';
import {getFieldsInitialState} from '../features/fields/fields-state.js';
import {getFoldingInitialState} from '../features/folding/folding-state.js';
import {getGeneratedAnswerInitialState} from '../features/generated-answer/generated-answer-state.js';
import {getInsightConfigurationInitialState} from '../features/insight-configuration/insight-configuration-state.js';
import {getInsightInterfaceInitialState} from '../features/insight-interface/insight-interface-state.js';
import {getInsightUserActionsInitialState} from '../features/insight-user-actions/insight-user-actions-state.js';
import {getPaginationInitialState} from '../features/pagination/pagination-state.js';
import {getQueryInitialState} from '../features/query/query-state.js';
import {getQuerySetInitialState} from '../features/query-set/query-set-state.js';
import {getQuerySuggestSetInitialState} from '../features/query-suggest/query-suggest-state.js';
import {getQuestionAnsweringInitialState} from '../features/question-answering/question-answering-state.js';
import {getRecentQueriesInitialState} from '../features/recent-queries/recent-queries-state.js';
import {getResultPreviewInitialState} from '../features/result-preview/result-preview-state.js';
import {getSearchInitialState} from '../features/search/search-state.js';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state.js';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-state.js';
import {getStaticFilterSetInitialState} from '../features/static-filter-set/static-filter-set-state.js';
import {getTabSetInitialState} from '../features/tab-set/tab-set-state.js';
import {getTriggerInitialState} from '../features/triggers/triggers-state.js';
import type {InsightAppState} from '../state/insight-app-state.js';

export function buildMockInsightState(
  config: Partial<InsightAppState> = {}
): InsightAppState {
  return {
    configuration: getConfigurationInitialState(),
    insightConfiguration: getInsightConfigurationInitialState(),
    search: getSearchInitialState(),
    insightInterface: getInsightInterfaceInitialState(),
    searchHub: getSearchHubInitialState(),
    version: 'unit-testing-version',
    insightCaseContext: getCaseContextInitialState(),
    query: getQueryInitialState(),
    facetSet: getFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    resultPreview: getResultPreviewInitialState(),
    facetSearchSet: getFacetSearchSetInitialState(),
    facetOptions: getFacetOptionsInitialState(),
    querySet: getQuerySetInitialState(),
    querySuggest: getQuerySuggestSetInitialState(),
    numericFacetSet: getNumericFacetSetInitialState(),
    dateFacetSet: getDateFacetSetInitialState(),
    categoryFacetSet: getCategoryFacetSetInitialState(),
    sortCriteria: getSortCriteriaInitialState(),
    didYouMean: getDidYouMeanInitialState(),
    staticFilterSet: getStaticFilterSetInitialState(),
    tabSet: getTabSetInitialState(),
    fields: getFieldsInitialState(),
    attachedResults: getAttachedResultsInitialState(),
    questionAnswering: getQuestionAnsweringInitialState(),
    folding: getFoldingInitialState(),
    generatedAnswer: getGeneratedAnswerInitialState(),
    context: getContextInitialState(),
    insightUserActions: getInsightUserActionsInitialState(),
    triggers: getTriggerInitialState(),
    recentQueries: getRecentQueriesInitialState(),
    ...config,
  };
}
