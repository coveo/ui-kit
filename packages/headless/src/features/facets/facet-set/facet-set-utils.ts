import type {SearchAction} from '../../search/search-actions.js';
import {
  facetDeselect,
  facetExclude,
  facetSelect,
  facetUnexclude,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetUnexclude,
} from './facet-set-analytics-actions.js';
import type {FacetSelectionChangeMetadata} from './facet-set-analytics-actions-utils.js';
import type {FacetValue} from './interfaces/response.js';

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
  selection: FacetValue
): SearchAction =>
  isFacetValueSelected(selection) ? facetDeselect() : facetSelect();

export const getLegacyAnalyticsActionForToggleFacetExclude = (
  facetId: string,
  selection: FacetValue
) => {
  const payload: FacetSelectionChangeMetadata = {
    facetId: facetId,
    facetValue: selection.value,
  };

  return isFacetValueExcluded(selection)
    ? logFacetUnexclude(payload)
    : logFacetExclude(payload);
};

export const getAnalyticsActionForToggleFacetExclude = (
  selection: FacetValue
): SearchAction =>
  isFacetValueExcluded(selection) ? facetUnexclude() : facetExclude();
