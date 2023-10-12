import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {LogStaticFilterToggleValueActionCreatorPayload} from './static-filter-set-actions.js';

export const logInsightStaticFilterDeselect = (
  metadata: LogStaticFilterToggleValueActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/staticFilter/deselect',
    AnalyticsType.Search,
    (client, state) =>
      client.logStaticFilterDeselect({
        ...metadata,
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
