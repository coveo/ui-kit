import {Value} from '@coveo/bueno';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../../analytics/analytics-utils.js';
import {SearchPageEvents} from '../../analytics/search-action-cause.js';
import type {SearchAction} from '../../search/search-actions.js';
import {facetIdDefinition} from '../generic/facet-actions-validation.js';
import type {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request.js';
import {
  buildFacetBaseMetadata,
  buildFacetSelectionChangeMetadata,
  getStateNeededForFacetMetadata,
} from './facet-set-analytics-actions-utils.js';
import type {FacetSortCriterion} from './interfaces/request.js';

export const logFacetShowMore = (facetId: string): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/showMore', (client, state) => {
    validatePayload(facetId, facetIdDefinition);
    const metadata = buildFacetBaseMetadata(
      facetId,
      getStateNeededForFacetMetadata(state)
    );
    return client.makeFacetShowMore(metadata);
  });

export const logFacetShowLess = (facetId: string): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/showLess', (client, state) => {
    validatePayload(facetId, facetIdDefinition);
    const metadata = buildFacetBaseMetadata(
      facetId,
      getStateNeededForFacetMetadata(state)
    );

    return client.makeFacetShowLess(metadata);
  });

export interface LogFacetUpdateSortActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The updated sort criterion.
   */
  criterion: FacetSortCriterion | RangeFacetSortCriterion;
}

//TODO: KIT-2859
export const logFacetUpdateSort = (
  payload: LogFacetUpdateSortActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/sortChange', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<FacetSortCriterion | RangeFacetSortCriterion>({
        required: true,
      }),
    });

    const {facetId, criterion} = payload;
    const stateForAnalytics = getStateNeededForFacetMetadata(state);

    const base = buildFacetBaseMetadata(facetId, stateForAnalytics);
    const metadata = {...base, criteria: criterion};

    return client.makeFacetUpdateSort(metadata);
  });

//TODO: KIT-2859
export const logFacetClearAll = (facetId: string): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/reset', (client, state) => {
    validatePayload(facetId, facetIdDefinition);

    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetBaseMetadata(facetId, stateForAnalytics);

    return client.makeFacetClearAll(metadata);
  });

export interface LogFacetSelectActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was selected.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetSelect = (
  payload: LogFacetSelectActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/select', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });

    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetSelect(metadata);
  });

export interface LogFacetExcludeActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was excluded.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetExclude = (
  payload: LogFacetExcludeActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/exclude', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });

    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetExclude(metadata);
  });

export interface LogFacetDeselectActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was deselected.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetDeselect = (
  payload: LogFacetDeselectActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/deselect', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });
    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetDeselect(metadata);
  });

export interface LogFacetUnexcludeActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was unexcluded.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetUnexclude = (
  payload: LogFacetUnexcludeActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/unexclude', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });
    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetUnexclude(metadata);
  });

export interface LogFacetBreadcrumbActionCreatorPayload {
  /**
   * The facet id associated with the breadcrumb.
   */
  facetId: string;

  /**
   * The facet value displayed in the breadcrumb.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetBreadcrumb = (
  payload: LogFacetBreadcrumbActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/breadcrumb', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      getStateNeededForFacetMetadata(state)
    );

    return client.makeBreadcrumbFacet(metadata);
  });

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------

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
