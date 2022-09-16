import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';

export const logSearchboxSubmit = makeInsightAnalyticsAction(
  'analytics/searchbox/submit',
  AnalyticsType.Search,
  (client, state) =>
    client.logSearchboxSubmit({
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);
