import {validatePayload} from '../../../../utils/validate-payload.js';
import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../../../analytics/analytics-utils.js';
import {
  getRangeFacetMetadata,
  rangeBreadcrumbFacet,
} from '../generic/range-facet-analytics-actions.js';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload.js';
import type {NumericFacetValue} from './interfaces/response.js';

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

export const numericBreadcrumbFacet = rangeBreadcrumbFacet;
