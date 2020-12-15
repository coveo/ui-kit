import {FacetSortCriterion} from './interfaces/request';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {validatePayload} from '../../../utils/validate-payload';
import {
  facetIdDefinition,
  requiredNonEmptyString,
} from '../generic/facet-actions-validation';
import {Value} from '@coveo/bueno';
import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../analytics/analytics-utils';
import {
  buildFacetBaseMetadata,
  FacetSelectionChangeMetadata,
  FacetUpdateSortMetadata,
  buildFacetStateMetadata,
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
      const facetState = buildFacetStateMetadata(stateForAnalytics);
      return client.logFacetSearch(metadata, facetState);
    }
  )();
/**
 * Logs a facet sort event.
 * @param payload (FacetUpdateSortMetadata) Object specifying the facet and sort criterion.
 */
export const logFacetUpdateSort = (payload: FacetUpdateSortMetadata) =>
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
      const facetState = buildFacetStateMetadata(stateForAnalytics);

      return client.logFacetUpdateSort(metadata, facetState);
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
      const facetState = buildFacetStateMetadata(stateForAnalytics);

      return client.logFacetClearAll(metadata, facetState);
    }
  )();

/**
 * Logs a facet value selection event.
 * @param payload (FacetSelectionChangeMetadata) Object specifying the target facet and value.
 */
export const logFacetSelect = (payload: FacetSelectionChangeMetadata) =>
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
      const facetState = buildFacetStateMetadata(stateForAnalytics);

      return client.logFacetSelect(metadata, facetState);
    }
  )();

/**
 * Logs a facet deselect event.
 * @param payload (FacetSelectionChangeMetadata) Object specifying the target facet and value.
 */
export const logFacetDeselect = (payload: FacetSelectionChangeMetadata) =>
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
      const facetState = buildFacetStateMetadata(stateForAnalytics);

      return client.logFacetDeselect(metadata, facetState);
    }
  )();
