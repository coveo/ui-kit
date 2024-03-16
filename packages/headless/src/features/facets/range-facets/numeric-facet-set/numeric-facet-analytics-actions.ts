import {validatePayload} from '../../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../../analytics/analytics-utils';
import {
  getRangeFacetMetadata,
  rangeBreadcrumbFacet,
} from '../generic/range-facet-analytics-actions';
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

export const numericBreadcrumbFacet = rangeBreadcrumbFacet;
