import {validatePayload} from '../../../../utils/validate-payload.js';
import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
} from '../../../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../../../case-context/case-context-state.js';
import {getRangeFacetMetadata} from '../generic/range-facet-analytics-actions.js';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload.js';
import {LogDateFacetBreadcrumbActionCreatorPayload} from './date-facet-analytics-actions.js';

export const logDateFacetBreadcrumb = (
  payload: LogDateFacetBreadcrumbActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/dateFacet/breadcrumb',
    AnalyticsType.Search,
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
