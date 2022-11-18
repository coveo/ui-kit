import {validatePayload} from '../../../../utils/validate-payload';
import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../../../case-context/case-context-state';
import {getRangeFacetMetadata} from '../generic/range-facet-analytics-actions';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload';
import {LogDateFacetBreadcrumbActionCreatorPayload} from './date-facet-analytics-actions';

export const logDateFacetBreadcrumb = (
  payload: LogDateFacetBreadcrumbActionCreatorPayload
) =>
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
  )();
