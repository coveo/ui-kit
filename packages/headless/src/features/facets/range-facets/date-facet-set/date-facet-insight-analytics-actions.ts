import {validatePayload} from '../../../../utils/validate-payload';
import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload';
import {getRangeFacetMetadata} from '../generic/range-facet-analytics-actions';
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
      const metadata = getRangeFacetMetadata(state, payload);

      return client.logBreadcrumbFacet(metadata);
    }
  )();
