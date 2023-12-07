import type {FacetRangeMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAnalyticsProvider} from '../../../../api/analytics/search-analytics';
import {SearchAppState} from '../../../../state/search-app-state';
import {SearchPageEvents} from '../../../analytics/search-action-cause';
import {SearchAction} from '../../../search/search-actions';
import {DateFacetValue} from '../date-facet-set/interfaces/response';
import {NumericFacetValue} from '../numeric-facet-set/interfaces/response';
import {RangeFacetSelectionPayload} from './range-facet-validate-payload';

export const getRangeFacetMetadata = (
  state: Partial<SearchAppState>,
  {facetId, selection}: RangeFacetSelectionPayload
): FacetRangeMetadata => {
  const facet = state.dateFacetSet![facetId] || state.numericFacetSet![facetId];
  const facetField = facet.request.field;
  const facetTitle = `${facetField}_${facetId}`;
  return {
    facetId,
    facetField,
    facetTitle,
    facetRangeEndInclusive: selection.endInclusive,
    facetRangeEnd: `${selection.end}`,
    facetRangeStart: `${selection.start}`,
  };
};

export const rangeBreadcrumbFacet = (
  id: string,
  value: DateFacetValue | NumericFacetValue
): SearchAction => {
  return {
    actionCause: SearchPageEvents.breadcrumbFacet,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getRangeBreadcrumbFacetMetadata(
        id,
        value
      ),
  };
};
