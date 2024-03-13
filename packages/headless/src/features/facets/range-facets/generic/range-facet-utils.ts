import {SearchAction} from '../../../search/search-actions';
import {
  facetDeselect,
  facetExclude,
  facetSelect,
  facetUnexclude,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetUnexclude,
} from '../../facet-set/facet-set-analytics-actions';
import {FacetSelectionChangeMetadata} from '../../facet-set/facet-set-analytics-actions-utils';
import {RangeFacetValue} from './interfaces/range-facet';

export const isRangeFacetValueSelected = (selection: RangeFacetValue) => {
  return selection.state === 'selected';
};

export const isRangeFacetValueExcluded = (selection: RangeFacetValue) => {
  return selection.state === 'excluded';
};

export const getLegacyAnalyticsActionForToggleRangeFacetSelect = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueSelected(selection)
    ? logFacetDeselect(payload)
    : logFacetSelect(payload);
};

export const getAnalyticsActionForToggleFacetSelect = (
  selection: RangeFacetValue
): SearchAction => {
  return isRangeFacetValueSelected(selection) ? facetDeselect() : facetSelect();
};

export const getLegacyAnalyticsActionForToggleRangeFacetExclude = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueExcluded(selection)
    ? logFacetUnexclude(payload)
    : logFacetExclude(payload);
};

export const getAnalyticsActionForToggleRangeFacetExclude = (
  selection: RangeFacetValue
): SearchAction => {
  return isRangeFacetValueExcluded(selection)
    ? facetUnexclude()
    : facetExclude();
};
