import {
  historyStore,
  getVisitorID,
} from '../../api/analytics/coveo-analytics-utils.js';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import {InsightQuerySuggestRequest} from '../../api/service/insight/query-suggest/query-suggest-request.js';
import {InsightAppState} from '../../state/insight-app-state.js';
import {
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
      ? historyStore.getHistory()
      : [],
    ...(s.insightCaseContext?.caseContext && {
      context: s.insightCaseContext.caseContext,
    }),
    ...(s.configuration.analytics.enabled && {
      visitorId: await getVisitorID(s.configuration.analytics),
      ...(s.configuration.analytics.enabled &&
        (await fromAnalyticsStateToAnalyticsParams(s.configuration.analytics))),
    }),
  };
};
