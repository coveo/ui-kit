import {validatePayload} from '../../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../../analytics/analytics-utils';
import {SearchAction} from '../../../search/search-actions';
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

//TODO: KIT-2859
export const logDateFacetBreadcrumb = (
  payload: LogDateFacetBreadcrumbActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/dateFacet/breadcrumb', (client, state) => {
    validatePayload(
      payload,
      rangeFacetSelectionPayloadDefinition(payload.selection)
    );
    const metadata = getRangeFacetMetadata(state, payload);

    return client.makeBreadcrumbFacet(metadata);
  });

export const dateBreadcrumbFacet = (
  id: string,
  value: DateFacetValue
): SearchAction => {
  return rangeBreadcrumbFacet(id, value);
};
