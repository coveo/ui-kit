import {FacetSelectionChangeMetadata} from './facet-set-analytics-actions-utils.js';
import {
  logFacetDeselect,
  logFacetSelect,
} from './facet-set-insight-analytics-actions.js';
import {FacetValue} from './interfaces/response.js';

export const isFacetValueSelected = (value: FacetValue) => {
  return value.state === 'selected';
};

export const getInsightAnalyticsActionForToggleFacetSelect = (
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
