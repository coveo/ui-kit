import {SearchAction} from '../../search/search-actions';
import {
  facetDeselect,
  facetExclude,
  facetSelect,
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

export const getLegacyAnalyticsActionForToggleFacetSelect = (
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

export const getAnalyticsActionForToggleFacetSelect = (
  facetId: string,
  selection: FacetValue
): SearchAction => {
  return isFacetValueSelected(selection)
    ? facetDeselect(facetId, selection.value)
    : facetSelect(facetId, selection.value);
};

export const getLegacyAnalyticsActionForToggleFacetExclude = (
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

export const getAnalyticsActionForToggleFacetExclude = (
  facetId: string,
  selection: FacetValue
): SearchAction => {
  return isFacetValueExcluded(selection)
    ? facetDeselect(facetId, selection.value)
    : facetExclude(facetId, selection.value);
};
