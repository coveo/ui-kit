import {SearchPageEvents} from 'coveo.analytics';
import {SearchAnalyticsProvider} from '../../../api/analytics/search-analytics';
import {SearchAction} from '../../search/search-actions';
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

export const getNextAnalyticsActionForToggleFacetSelect = (
  facetId: string,
  selection: FacetValue
): SearchAction => {
  return {
    actionCause: isFacetValueSelected(selection)
      ? SearchPageEvents.facetSelect
      : SearchPageEvents.facetDeselect,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(
        facetId,
        selection.value
      ),
  };
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
