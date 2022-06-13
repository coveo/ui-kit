import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getFacetOptionsInitialState} from '../features/facet-options/facet-options-state';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getInsightConfigurationInitialState} from '../features/insight-configuration/insight-configuration-state';
import {getInsightInterfaceInitialState} from '../features/insight-interface/insight-interface-state';
import {getInsightCaseContextSearchInitialState} from '../features/insight-search/insight-case-context-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
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
    insightCaseContext: getInsightCaseContextSearchInitialState(),
    query: getQueryInitialState(),
    facetSet: getFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    resultPreview: getResultPreviewInitialState(),
    facetSearchSet: getFacetSearchSetInitialState(),
    facetOptions: getFacetOptionsInitialState(),
    ...config,
  };
}
