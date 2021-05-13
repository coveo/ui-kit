import {validatePayload} from '../../../../utils/validate-payload';
import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {rangeFacetSelectionPayloadDefinition} from '../generic/range-facet-validate-payload';
import {getRangeFacetMetadata} from '../generic/range-facet-analytics-actions';
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

/**
 * Logs a date facet breadcrumb event.
 * @param payload (LogDateFacetBreadcrumbActionCreatorPayload) Object specifying the target facet and selection.
 */
export const logDateFacetBreadcrumb = (
  payload: LogDateFacetBreadcrumbActionCreatorPayload
) =>
  makeAnalyticsAction(
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
