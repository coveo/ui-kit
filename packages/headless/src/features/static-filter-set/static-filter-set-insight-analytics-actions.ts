import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {LogStaticFilterToggleValueActionCreatorPayload} from './static-filter-set-actions';

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
