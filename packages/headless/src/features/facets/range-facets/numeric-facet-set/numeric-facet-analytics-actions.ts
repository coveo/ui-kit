import {validatePayload} from '../../../../utils/validate-payload.js';
import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../../../analytics/analytics-utils.js';
import {getRangeFacetMetadata} from '../generic/range-facet-analytics-actions.js';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload.js';
import {NumericFacetValue} from './interfaces/response.js';

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

export const logNumericFacetBreadcrumb = (
  payload: LogNumericFacetBreadcrumbActionCreatorPayload
): SearchAction =>
  makeAnalyticsAction(
    'analytics/numericFacet/breadcrumb',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(
        payload,
        rangeFacetSelectionPayloadDefinition(payload.selection)
      );
      const metadata = getRangeFacetMetadata(state, payload);

      return client.makeBreadcrumbFacet(metadata);
    }
  );
