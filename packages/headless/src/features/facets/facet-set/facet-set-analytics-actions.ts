import {FacetSortCriterion} from './interfaces/request';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {Value} from '@coveo/bueno';
import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../analytics/analytics-utils';
import {
  buildFacetBaseMetadata,
  getStateNeededForFacetMetadata,
  buildFacetSelectionChangeMetadata,
} from './facet-set-analytics-actions-utils';

export interface FacetValueAnalyticPayload {
  /**
   * The ID of the event's target facet.
   */
  facetId: string;
  /**
   * The target value of the event.
   */
  facetValue: string;
}

export interface FacetUpdateSortAnalyticPayload {
  /**
   * The ID of the event's target facet.
   */
  facetId: string;
  /**
   * The new criterion of the target facet.
   */
  criterion: FacetSortCriterion | RangeFacetSortCriterion;
}

/**
 * Logs a facet show more event.
 * @param facetId - The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetShowMore = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/showMore',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );
      return client.logFacetShowMore(metadata);
    }
  )();
/**
 * Logs a facet show less event.
 * @param facetId - The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetShowLess = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/showLess',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );

      return client.logFacetShowLess(metadata);
    }
  )();

/**
 * Logs a facet search event.
 * @param facetId - The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetSearch = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/search',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = buildFacetBaseMetadata(facetId, stateForAnalytics);

      return client.logFacetSearch(metadata);
    }
  )();
/**
 * Logs a facet sort event.
 * @param payload - Object specifying the facet and sort criterion.
 */
export const logFacetUpdateSort = (payload: FacetUpdateSortAnalyticPayload) =>
  makeAnalyticsAction(
    'analytics/facet/sortChange',
    AnalyticsType.Search,
    (client, state) => {
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

      return client.logFacetUpdateSort(metadata);
    }
  )();

/**
 * Logs a facet clear all event.
 * @param facetId - The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetClearAll = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/reset',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);

      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = buildFacetBaseMetadata(facetId, stateForAnalytics);

      return client.logFacetClearAll(metadata);
    }
  )();

/**
 * Logs a facet value selection event.
 * @param payload - Object specifying the target facet and value.
 */
export const logFacetSelect = (payload: FacetValueAnalyticPayload) =>
  makeAnalyticsAction(
    'analytics/facet/select',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });

      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = buildFacetSelectionChangeMetadata(
        payload,
        stateForAnalytics
      );

      return client.logFacetSelect(metadata);
    }
  )();

/**
 * Logs a facet deselect event.
 * @param payload - Object specifying the target facet and value.
 */
export const logFacetDeselect = (payload: FacetValueAnalyticPayload) =>
  makeAnalyticsAction(
    'analytics/facet/deselect',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });
      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = buildFacetSelectionChangeMetadata(
        payload,
        stateForAnalytics
      );

      return client.logFacetDeselect(metadata);
    }
  )();

/**
 * Logs a facet breadcrumb event.
 * @param payload - Object specifying the target facet and value.
 */
export const logFacetBreadcrumb = (payload: FacetValueAnalyticPayload) =>
  makeAnalyticsAction(
    'analytics/facet/breadcrumb',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });
      const metadata = buildFacetSelectionChangeMetadata(
        payload,
        getStateNeededForFacetMetadata(state)
      );

      return client.logBreadcrumbFacet(metadata);
    }
  )();
