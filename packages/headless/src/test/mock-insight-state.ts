import {getAttachedResultsInitialState} from '../features/attached-results/attached-results-state';
import {getCaseContextInitialState} from '../features/case-context/case-context-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getDidYouMeanInitialState} from '../features/did-you-mean/did-you-mean-state';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state';
import {getCategoryFacetSetInitialState} from '../features/facets/category-facet-set/category-facet-set-state';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getDateFacetSetInitialState} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getFieldsInitialState} from '../features/fields/fields-state';
import {getFoldingInitialState} from '../features/folding/folding-state';
import {getGeneratedAnswerInitialState} from '../features/generated-answer/generated-answer-state';
import {getInsightConfigurationInitialState} from '../features/insight-configuration/insight-configuration-state';
import {getInsightInterfaceInitialState} from '../features/insight-interface/insight-interface-state';
import {getInsightUserActionsInitialState} from '../features/insight-user-actions/insight-user-actions-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getQuerySetInitialState} from '../features/query-set/query-set-state';
import {getQuerySuggestSetInitialState} from '../features/query-suggest/query-suggest-state';
import {getQueryInitialState} from '../features/query/query-state';
import {getQuestionAnsweringInitialState} from '../features/question-answering/question-answering-state';
import {getResultPreviewInitialState} from '../features/result-preview/result-preview-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {getSearchInitialState} from '../features/search/search-state';
import {getSortCriteriaInitialState} from '../features/sort-criteria/sort-criteria-state';
import {getStaticFilterSetInitialState} from '../features/static-filter-set/static-filter-set-state';
import {getTabSetInitialState} from '../features/tab-set/tab-set-state';
import {getTriggerInitialState} from '../features/triggers/triggers-state';
import {InsightAppState} from '../state/insight-app-state';

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
    ...config,
  };
}
