import {FacetSelectionChangeMetadata} from './facet-set-analytics-actions-utils';
import {
  logFacetDeselect,
  logFacetSelect,
} from './facet-set-product-listing-v2-analytics-actions';
import {FacetValue} from './interfaces/response';

export const isFacetValueSelected = (value: FacetValue) => {
  return value.state === 'selected';
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
