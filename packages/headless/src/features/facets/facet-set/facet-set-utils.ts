import {FacetValue} from './interfaces/response';
import {logFacetDeselect, logFacetSelect} from './facet-set-analytics-actions';
import {
  logFacetDeselect as logInsightFacetDeselect,
  logFacetSelect as logInsightFacetSelect,
} from './facet-set-insight-analytics-actions';
import {FacetSelectionChangeMetadata} from './facet-set-analytics-actions-utils';

export const isFacetValueSelected = (value: FacetValue) => {
  return value.state === 'selected';
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

export const getInsightAnalyticsActionForToggleFacetSelect = (
  facetId: string,
  selection: FacetValue
) => {
  const payload: FacetSelectionChangeMetadata = {
    facetId: facetId,
    facetValue: selection.value,
  };

  return isFacetValueSelected(selection)
    ? logInsightFacetDeselect(payload)
    : logInsightFacetSelect(payload);
};
