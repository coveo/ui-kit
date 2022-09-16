import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';

export const logDidYouMeanClick = makeInsightAnalyticsAction(
  'analytics/didyoumean/click',
  AnalyticsType.Search,
  (client, state) =>
    client.logDidYouMeanClick({
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);

export const logDidYouMeanAutomatic = makeInsightAnalyticsAction(
  'analytics/didyoumean/automatic',
  AnalyticsType.Search,
  (client, state) =>
    client.logDidYouMeanAutomatic({
      caseContext: state.insightCaseContext?.caseContext || {},
      caseId: state.insightCaseContext?.caseId,
      caseNumber: state.insightCaseContext?.caseNumber,
    })
);
