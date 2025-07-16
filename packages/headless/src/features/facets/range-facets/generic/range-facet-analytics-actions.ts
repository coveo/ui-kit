import type {FacetRangeMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents.js';
import type {SearchAppState} from '../../../../state/search-app-state.js';
import {SearchPageEvents} from '../../../analytics/search-action-cause.js';
import type {SearchAction} from '../../../search/search-actions.js';
import type {RangeFacetSelectionPayload} from './range-facet-validate-payload.js';

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

export const rangeBreadcrumbFacet = (): SearchAction => ({
  actionCause: SearchPageEvents.breadcrumbFacet,
});
