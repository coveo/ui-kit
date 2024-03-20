import {Value} from '@coveo/bueno';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../analytics/analytics-utils';
import {SearchPageEvents} from '../../analytics/search-action-cause';
import {SearchAction} from '../../search/search-actions';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {
  buildFacetBaseMetadata,
  getStateNeededForFacetMetadata,
  buildFacetSelectionChangeMetadata,
} from './facet-set-analytics-actions-utils';
import {FacetSortCriterion} from './interfaces/request';

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const facetUpdateSort = (): SearchAction => ({
  actionCause: SearchPageEvents.facetUpdateSort,
});

export const facetClearAll = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.facetClearAll,
  };
};

export const facetSelect = (): SearchAction => ({
  actionCause: SearchPageEvents.facetSelect,
});

export const facetExclude = (): SearchAction => ({
  actionCause: SearchPageEvents.facetExclude,
});

export const facetDeselect = (): SearchAction => ({
  actionCause: SearchPageEvents.facetDeselect,
});

export const facetUnexclude = (): SearchAction => ({
  actionCause: SearchPageEvents.facetUnexclude,
});

export const breadcrumbFacet = (): SearchAction => ({
  actionCause: SearchPageEvents.breadcrumbFacet,
});
