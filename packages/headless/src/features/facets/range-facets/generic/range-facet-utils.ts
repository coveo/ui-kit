import {SearchAnalyticsProvider} from '../../../../api/analytics/search-analytics';
import {SearchPageEvents} from '../../../analytics/search-action-cause';
import {SearchAction} from '../../../search/search-actions';
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
  facetId: string,
  selection: RangeFacetValue
): SearchAction => {
  return {
    actionCause: isRangeFacetValueSelected(selection)
      ? SearchPageEvents.facetSelect
      : SearchPageEvents.facetDeselect,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(
        facetId,
        `${selection.start}..${selection.end}`
      ),
  };
};

export const getLegacyAnalyticsActionForToggleRangeFacetExclude = (
  facetId: string,
  selection: RangeFacetValue
) => {
  const facetValue = `${selection.start}..${selection.end}`;
  const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

  return isRangeFacetValueExcluded(selection)
    ? logFacetDeselect(payload)
    : logFacetExclude(payload);
};

export const getAnalyticsActionForToggleRangeFacetExclude = (
  facetId: string,
  selection: RangeFacetValue
): SearchAction => {
  return {
    actionCause: isRangeFacetValueExcluded(selection)
      ? SearchPageEvents.facetUnexclude
      : SearchPageEvents.facetExclude,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(
        facetId,
        `${selection.start}..${selection.end}`
      ),
  };
};
