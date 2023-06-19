import {
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
} from './facet-set-analytics-actions';
import {FacetSelectionChangeMetadata} from './facet-set-analytics-actions-utils';
import {FacetValue} from './interfaces/response';

export const isFacetValueSelected = (value: FacetValue) => {
  return value.state === 'selected';
};

export const isFacetValueExcluded = (value: FacetValue) => {
  return value.state === 'excluded';
};

export const getAnalyticsActionForToggleFacetSelect = (
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

export const getAnalyticsActionForToggleFacetExclude = (
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
