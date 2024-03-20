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
import {DateFacetValue} from './interfaces/response';

export interface LogDateFacetBreadcrumbActionCreatorPayload {
  /**
   * The facet id of the date facet corresponding to the breadcrumb.
   */
  facetId: string;

  /**
   * The date facet value deselected using the breadcrumb.
   */
  selection: DateFacetValue;
}

export const dateBreadcrumbFacet = rangeBreadcrumbFacet;
