import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import type {InsightQuerySuggestRequest} from '../../api/service/insight/query-suggest/query-suggest-request.js';
import type {InsightAppState} from '../../state/insight-app-state.js';
import type {
  ConfigurationSection,
  InsightConfigurationSection,
} from '../../state/state-sections.js';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/legacy-analytics-params.js';

type StateNeededByQuerySuggest = ConfigurationSection &
  InsightConfigurationSection &
  Partial<InsightAppState>;

export const buildInsightQuerySuggestRequest = async (
  id: string,
  s: StateNeededByQuerySuggest
): Promise<InsightQuerySuggestRequest> => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url: getOrganizationEndpoint(
      s.configuration.organizationId,
      s.configuration.environment
    ),
    count: s.querySuggest![id]!.count,
    insightId: s.insightConfiguration.insightId,
    q: s.querySet?.[id],
    timezone: s.configuration.search.timezone,
    actionsHistory: s.configuration.analytics.enabled
      ? HistoryStore.getInstance().getHistory()
      : [],
    ...(s.insightCaseContext?.caseContext && {
      context: s.insightCaseContext.caseContext,
    }),
    ...(s.configuration.analytics.enabled && {
      ...(s.configuration.analytics.enabled &&
        (await fromAnalyticsStateToAnalyticsParams(s.configuration.analytics))),
    }),
  };
};
