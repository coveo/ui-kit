import {FacetSelectionChangeMetadata} from './facet-set-analytics-actions-utils.js';
import {
  logFacetDeselect,
  logFacetSelect,
  logFacetExclude,
} from './facet-set-product-listing-analytics-actions.js';
import {FacetValue} from './interfaces/response.js';

export const isFacetValueSelected = (value: FacetValue) => {
  return value.state === 'selected';
};
export const isFacetValueExcluded = (value: FacetValue) => {
  return value.state === 'excluded';
};

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
