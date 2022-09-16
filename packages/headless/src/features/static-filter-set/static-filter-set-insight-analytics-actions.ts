import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {LogStaticFilterToggleValueActionCreatorPayload} from './static-filter-set-actions';

export const logInsightStaticFilterDeselect = (
  metadata: LogStaticFilterToggleValueActionCreatorPayload
) =>
  makeInsightAnalyticsAction(
    'analytics/staticFilter/deselect',
    AnalyticsType.Search,
    (client, state) =>
      client.logStaticFilterDeselect({
        ...metadata,
        caseContext: state.insightCaseContext?.caseContext || {},
        caseId: state.insightCaseContext?.caseId,
        caseNumber: state.insightCaseContext?.caseNumber,
      })
  )();
