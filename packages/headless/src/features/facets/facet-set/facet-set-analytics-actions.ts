import {Value} from '@coveo/bueno';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../analytics/analytics-utils';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {
  buildFacetBaseMetadata,
  getStateNeededForFacetMetadata,
  buildFacetSelectionChangeMetadata,
} from './facet-set-analytics-actions-utils';
import {FacetSortCriterion} from './interfaces/request';

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

//TODO: KIT-2859
export const logFacetExclude = (
  payload: LogFacetSelectActionCreatorPayload
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
