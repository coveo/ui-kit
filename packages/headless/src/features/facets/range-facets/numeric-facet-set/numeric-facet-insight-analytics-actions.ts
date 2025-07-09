import {validatePayload} from '../../../../utils/validate-payload.js';
import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../../../analytics/analytics-utils.js';
import {SearchPageEvents} from '../../../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../../../case-context/case-context-state.js';
import {getRangeFacetMetadata} from '../generic/range-facet-insight-analytics-actions.js';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload.js';
import type {LogNumericFacetBreadcrumbActionCreatorPayload} from './numeric-facet-analytics-actions.js';

export const logNumericFacetBreadcrumb = (
  payload: LogNumericFacetBreadcrumbActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.breadcrumbFacet)(
    'analytics/numericFacet/breadcrumb',
    (client, state) => {
      validatePayload(
        payload,
        rangeFacetSelectionPayloadDefinition(payload.selection)
      );
      const metadata = {
        ...getRangeFacetMetadata(state, payload),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logBreadcrumbFacet(metadata);
    }
  );
