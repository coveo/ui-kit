import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../../analytics/analytics-utils';

export const logClearBreadcrumbs = () =>
  makeInsightAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client, state) => {
      return client.logBreadcrumbResetAll({
        caseContext: state.insightCaseContext?.caseContext || {},
        caseId: state.insightCaseContext?.caseId,
        caseNumber: state.insightCaseContext?.caseNumber,
      });
    }
  )();
