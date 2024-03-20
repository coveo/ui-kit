import {SearchAction} from '../../search/search-actions';
import {
  facetDeselect,
  facetExclude,
  facetSelect,
  facetUnexclude,
} from './facet-set-analytics-actions';
import {FacetSelectionChangeMetadata} from './facet-set-analytics-actions-utils';
import {FacetValue} from './interfaces/response';

export const isFacetValueSelected = (value: FacetValue) => {
  return value.state === 'selected';
};

export const isFacetValueExcluded = (value: FacetValue) => {
  return value.state === 'excluded';
};

// export const getLegacyAnalyticsActionForToggleFacetSelect = (
//   facetId: string,
//   selection: FacetValue
// ) => {
//   const payload: FacetSelectionChangeMetadata = {
//     facetId: facetId,
//     facetValue: selection.value,
//   };

//   return isFacetValueSelected(selection)
//     ? logFacetDeselect(payload)
//     : logFacetSelect(payload);
// };

export const getAnalyticsActionForToggleFacetSelect = (
  selection: FacetValue
): SearchAction =>
  isFacetValueSelected(selection) ? facetDeselect() : facetSelect();

// export const getLegacyAnalyticsActionForToggleFacetExclude = (
//   facetId: string,
//   selection: FacetValue
// ) => {
//   const payload: FacetSelectionChangeMetadata = {
//     facetId: facetId,
//     facetValue: selection.value,
//   };

//   return isFacetValueExcluded(selection)
//     ? logFacetUnexclude(payload)
//     : logFacetExclude(payload);
// };

export const getAnalyticsActionForToggleFacetExclude = (
  selection: FacetValue
): SearchAction =>
  isFacetValueExcluded(selection) ? facetUnexclude() : facetExclude();
