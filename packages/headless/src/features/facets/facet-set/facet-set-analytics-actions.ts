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

/**
 * Logs a facet show more event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
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
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
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
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
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

/**
 * Logs a facet sort event.
 * @param payload (LogFacetUpdateSortActionCreatorPayload) Object specifying the facet and sort criterion.
 */
export const logFacetUpdateSort = (
  payload: LogFacetUpdateSortActionCreatorPayload
) =>
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
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
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

/**
 * Logs a facet value selection event.
 * @param payload (LogFacetSelectActionCreatorPayload) Object specifying the target facet and value.
 */
export const logFacetSelect = (payload: LogFacetSelectActionCreatorPayload) =>
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

/**
 * Logs a facet deselect event.
 * @param payload (LogFacetDeselectActionCreatorPayload) Object specifying the target facet and value.
 */
export const logFacetDeselect = (
  payload: LogFacetDeselectActionCreatorPayload
) =>
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

/**
 * Logs a facet breadcrumb event.
 * @param payload (LogFacetBreadcrumbActionCreatorPayload) Object specifying the target facet and value.
 */
export const logFacetBreadcrumb = (
  payload: LogFacetBreadcrumbActionCreatorPayload
) =>
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
