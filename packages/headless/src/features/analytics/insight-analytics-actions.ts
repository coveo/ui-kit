import {AnalyticsType, makeInsightAnalyticsAction} from './analytics-utils';

export const logInsightInterfaceLoad = makeInsightAnalyticsAction(
  'analytics/interface/load',
  AnalyticsType.Search,
  (client, state) =>
    client.logInterfaceLoad({
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);

export const logInsightInterfaceChange = makeInsightAnalyticsAction(
  'analytics/interface/change',
  AnalyticsType.Search,
  (client, state) => {
    client.logInterfaceChange({
      interfaceChangeTo: state.configuration.analytics.originLevel2,
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    });
  }
);
