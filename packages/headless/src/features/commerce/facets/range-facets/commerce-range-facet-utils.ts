import {FacetSelectionChangeMetadata} from '../../../facets/facet-set/facet-set-analytics-actions-utils';
import {
  logFacetDeselect,
  logFacetSelect,
} from '../../../facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {RangeFacetValue} from '../../../facets/range-facets/generic/interfaces/range-facet';
import {isRangeFacetValueSelected} from '../../../facets/range-facets/generic/range-facet-utils';

export const getAnalyticsActionForToggleProductListingRangeFacetSelect = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueSelected(selection)
    ? logFacetDeselect(payload)
    : logFacetSelect(payload);
};
