import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getFacetSetInitialState} from '../features/facets/facet-set/facet-set-state';
import {getInsightConfigurationInitialState} from '../features/insight-configuration/insight-configuration-state';
import {getInsightInterfaceInitialState} from '../features/insight-interface/insight-interface-state';
import {
  getInsightCaseContextSearchInitialState,
  getInsightSearchInitialState,
} from '../features/insight-search/insight-search-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getQueryInitialState} from '../features/query/query-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {InsightAppState} from '../state/insight-app-state';

export function buildMockInsightState(
  config: Partial<InsightAppState> = {}
): InsightAppState {
  return {
    configuration: getConfigurationInitialState(),
    insightConfiguration: getInsightConfigurationInitialState(),
    insightSearch: getInsightSearchInitialState(),
    insightInterface: getInsightInterfaceInitialState(),
    searchHub: getSearchHubInitialState(),
    version: 'unit-testing-version',
    insightCaseContext: getInsightCaseContextSearchInitialState(),
    query: getQueryInitialState(),
    facetSet: getFacetSetInitialState(),
    pagination: getPaginationInitialState(),
    ...config,
  };
}
