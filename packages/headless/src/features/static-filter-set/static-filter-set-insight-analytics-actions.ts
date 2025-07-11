import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import type {LogStaticFilterToggleValueActionCreatorPayload} from './static-filter-set-actions.js';

export const logInsightStaticFilterDeselect = (
  metadata: LogStaticFilterToggleValueActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.staticFilterDeselect)(
    'analytics/staticFilter/deselect',
    (client, state) =>
      client.logStaticFilterDeselect({
        ...metadata,
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
