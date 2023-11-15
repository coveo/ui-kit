import {FacetSelectionChangeMetadata} from '../../facets/facet-set/facet-set-analytics-actions-utils';
import {
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
} from '../../facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {
  isFacetValueExcluded,
  isFacetValueSelected,
} from '../../facets/facet-set/facet-set-utils';
import {FacetValue} from '../../facets/facet-set/interfaces/response';

export const getProductListingAnalyticsActionForToggleFacetSelect = (
  facetId: string,
  selection: FacetValue
) => {
  const payload: FacetSelectionChangeMetadata = {
    facetId: facetId,
    facetValue: selection.value,
  };

  return isFacetValueSelected(selection)
    ? logFacetDeselect(payload)
    : logFacetSelect(payload);
};

export const getProductListingAnalyticsActionForToggleFacetExclude = (
  facetId: string,
  selection: FacetValue
) => {
  const payload: FacetSelectionChangeMetadata = {
    facetId: facetId,
    facetValue: selection.value,
  };

  return isFacetValueExcluded(selection)
    ? logFacetDeselect(payload)
    : logFacetExclude(payload);
};
