import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {AnalyticsType} from './analytics-utils';
import {
  InsightAction,
  makeInsightAnalyticsAction,
} from './insight-analytics-utils';

export const logInsightInterfaceLoad = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/interface/load',
    AnalyticsType.Search,
    (client, state) =>
      client.logInterfaceLoad(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logInsightInterfaceChange = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/interface/change',
    AnalyticsType.Search,
    (client, state) => {
      client.logInterfaceChange({
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
        interfaceChangeTo: state.configuration.analytics.originLevel2,
      });
    }
  );
