import {getCaseContexttInitialState} from '../features/case-context/case-context-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getInsightConfigurationInitialState} from '../features/insight-configuration/insight-configuration-state';
import {getInsightInterfaceInitialState} from '../features/insight-interface/insight-interface-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getQuerySetInitialState} from '../features/query-set/query-set-state';
import {getQuerySuggestSetInitialState} from '../features/query-suggest/query-suggest-state';
import {getQueryInitialState} from '../features/query/query-state';
import {getResultPreviewInitialState} from '../features/result-preview/result-preview-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {getSearchInitialState} from '../features/search/search-state';
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
    insightCaseContext: getCaseContexttInitialState(),
    query: getQueryInitialState(),
    facetSet: getFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    resultPreview: getResultPreviewInitialState(),
    querySet: getQuerySetInitialState(),
    querySuggest: getQuerySuggestSetInitialState(),
    ...config,
  };
}
