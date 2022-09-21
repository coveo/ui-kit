import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {AnalyticsType, makeInsightAnalyticsAction} from './analytics-utils';

export const logInsightInterfaceLoad = makeInsightAnalyticsAction(
  'analytics/interface/load',
  AnalyticsType.Search,
  (client, state) =>
    client.logInterfaceLoad(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
);

export const logInsightInterfaceChange = makeInsightAnalyticsAction(
  'analytics/interface/change',
  AnalyticsType.Search,
  (client, state) => {
    client.logInterfaceChange({
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      interfaceChangeTo: state.configuration.analytics.originLevel2,
    });
  }
);
