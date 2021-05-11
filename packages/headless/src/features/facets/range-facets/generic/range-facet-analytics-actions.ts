import {FacetRangeMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';
import {SearchAppState} from '../../../../state/search-app-state';
import {validatePayload} from '../../../../utils/validate-payload';
import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../../analytics/analytics-utils';
import {
  RangeFacetSelectionPayload,
  rangeFacetSelectionPayloadDefinition,
} from './range-facet-validate-payload';

export const getRangeFacetMetadata = (
  state: Partial<SearchAppState>,
  {facetId, selection}: RangeFacetSelectionPayload
): FacetRangeMetadata => {
  const facet = state.dateFacetSet![facetId] || state.numericFacetSet![facetId];
  const facetField = facet.field;
  const facetTitle = `${facet.field}_${facetId}`;
  return {
    facetId,
    facetField,
    facetTitle,
    facetRangeEndInclusive: selection.endInclusive,
    facetRangeEnd: `${selection.end}`,
    facetRangeStart: `${selection.start}`,
  };
};

/**
 * Logs a range facet breadcrumb event.
 * @param payload (RangeFacetSelectionPayload) Object specifying the target facet and selection.
 */
export const logRangeFacetBreadcrumb = (payload: RangeFacetSelectionPayload) =>
  makeAnalyticsAction(
    'analytics/rangeFacet/breadcrumb',
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
