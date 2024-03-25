import {validatePayload} from '../../../../utils/validate-payload';
import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../../../analytics/analytics-utils';
import {SearchPageEvents} from '../../../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../../../case-context/case-context-state';
import {getRangeFacetMetadata} from '../generic/range-facet-insight-analytics-actions';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload';
import {LogNumericFacetBreadcrumbActionCreatorPayload} from './numeric-facet-analytics-actions';

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
