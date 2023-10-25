import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {InsightAction, makeInsightAnalyticsAction} from './analytics-utils';

export const logInsightInterfaceLoad = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/interface/load', (client, state) =>
    client.logInterfaceLoad(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const logInsightInterfaceChange = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/interface/change', (client, state) => {
    client.logInterfaceChange({
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      interfaceChangeTo: state.configuration.analytics.originLevel2,
    });
  });
