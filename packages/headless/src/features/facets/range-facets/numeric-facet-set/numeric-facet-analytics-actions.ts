import {validatePayload} from '../../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
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

//TODO: KIT-2859
export const logNumericFacetBreadcrumb = (
  payload: LogNumericFacetBreadcrumbActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/numericFacet/breadcrumb', (client, state) => {
    validatePayload(
      payload,
      rangeFacetSelectionPayloadDefinition(payload.selection)
    );
    const metadata = getRangeFacetMetadata(state, payload);

    return client.makeBreadcrumbFacet(metadata);
  });
