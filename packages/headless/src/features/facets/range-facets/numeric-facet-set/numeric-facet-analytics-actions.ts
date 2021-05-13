import {validatePayload} from '../../../../utils/validate-payload';
import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {getRangeFacetMetadata} from '../generic/range-facet-analytics-actions';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload';
import {NumericFacetValue} from './interfaces/response';

export interface LogNumericFacetBreadcrumbActionCreatorPayload {
  /**
   * The facet id of the numeric facet corresponding to the breadcrumb.
   */
  facetId: string;

  /**
   * The numeric facet value deselected using the breadcrumb.
   */
  selection: NumericFacetValue;
}

/**
 * Logs a numeric facet breadcrumb event.
 */
export const logNumericFacetBreadcrumb = (
  payload: LogNumericFacetBreadcrumbActionCreatorPayload
) =>
  makeAnalyticsAction(
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
