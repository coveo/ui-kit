import {validatePayload} from '../../../../utils/validate-payload.js';
import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../../../analytics/analytics-utils.js';
import {getRangeFacetMetadata} from '../generic/range-facet-analytics-actions.js';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload.js';
import {DateFacetValue} from './interfaces/response.js';

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

export const logDateFacetBreadcrumb = (
  payload: LogDateFacetBreadcrumbActionCreatorPayload
): SearchAction =>
  makeAnalyticsAction(
    'analytics/dateFacet/breadcrumb',
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
