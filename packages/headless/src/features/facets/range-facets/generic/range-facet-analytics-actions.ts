import {FacetRangeMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';
import {SearchAppState} from '../../../../state/search-app-state';
import {RangeFacetSelectionPayload} from './range-facet-validate-payload';

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
