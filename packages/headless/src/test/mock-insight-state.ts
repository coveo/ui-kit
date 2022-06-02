import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getInsightConfigurationInitialState} from '../features/insight-configuration/insight-configuration-state';
import {getInsightSearchInitialState} from '../features/insight-search/insight-search-state';
import {InsightAppState} from '../state/insight-app-state';

export function buildMockInsightState(
  config: Partial<InsightAppState> = {}
): InsightAppState {
  return {
    configuration: getConfigurationInitialState(),
    insightConfiguration: getInsightConfigurationInitialState(),
    insightSearch: getInsightSearchInitialState(),
    ...config,
  };
}
