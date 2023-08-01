import {
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
} from '../../facet-set/facet-set-analytics-actions';
import {FacetSelectionChangeMetadata} from '../../facet-set/facet-set-analytics-actions-utils';
import {RangeFacetValue} from './interfaces/range-facet';

export const isRangeFacetValueSelected = (selection: RangeFacetValue) => {
  return selection.state === 'selected';
};

export const isRangeFacetValueExcluded = (selection: RangeFacetValue) => {
  return selection.state === 'excluded';
};

export const getAnalyticsActionForToggleRangeFacetSelect = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueSelected(selection)
    ? logFacetDeselect(payload)
    : logFacetSelect(payload);
};

export const getAnalyticsActionForToggleRangeFacetExclude = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueExcluded(selection)
    ? logFacetDeselect(payload)
    : logFacetExclude(payload);
};
