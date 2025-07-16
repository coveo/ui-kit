import type {FacetSelectionChangeMetadata} from '../../facet-set/facet-set-analytics-actions-utils.js';
import {
  logFacetDeselect,
  logFacetSelect,
} from '../../facet-set/facet-set-insight-analytics-actions.js';
import type {RangeFacetValue} from './interfaces/range-facet.js';
import {isRangeFacetValueSelected} from './range-facet-utils.js';

export const getInsightAnalyticsActionForToggleRangeFacetSelect = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueSelected(selection)
    ? logFacetDeselect(payload)
    : logFacetSelect(payload);
};
