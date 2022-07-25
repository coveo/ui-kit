import {validatePayload} from '../../../../utils/validate-payload';
import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {getRangeFacetMetadata} from '../generic/range-facet-insight-analytics-actions';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload';
import {LogNumericFacetBreadcrumbActionCreatorPayload} from './numeric-facet-analytics-actions';

export const logNumericFacetBreadcrumb = (
  payload: LogNumericFacetBreadcrumbActionCreatorPayload
) =>
  makeInsightAnalyticsAction(
    'analytics/numericFacet/breadcrumb',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(
        payload,
        rangeFacetSelectionPayloadDefinition(payload.selection)
      );
      const metadata = getRangeFacetMetadata(state, payload);

      return client.logBreadcrumbFacet(metadata);
    }
  )();
