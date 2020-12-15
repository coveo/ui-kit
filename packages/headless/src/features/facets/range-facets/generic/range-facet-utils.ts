import {RangeFacetValue} from './interfaces/range-facet';
import {
  logFacetDeselect,
  logFacetSelect,
} from '../../facet-set/facet-set-analytics-actions';
import {FacetSelectionChangeMetadata} from '../../facet-set/facet-set-analytics-actions-utils';

export const isRangeFacetValueSelected = (selection: RangeFacetValue) => {
  return selection.state === 'selected';
};

export const getAnalyticsRangeValue = ({start, end}: RangeFacetValue) =>
  `${start}..${end}`;

export const getAnalyticsActionForToggleRangeFacetSelect = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = getAnalyticsRangeValue(selection);
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueSelected(selection)
    ? logFacetDeselect(payload)
    : logFacetSelect(payload);
};
