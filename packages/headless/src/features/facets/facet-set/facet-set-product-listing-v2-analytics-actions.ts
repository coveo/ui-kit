import {Value} from '@coveo/bueno';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';
import {
  ProductListingV2Action,
  makeCommerceAnalyticsAction,
} from '../../analytics/analytics-utils';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {LogFacetBreadcrumbActionCreatorPayload} from './facet-set-analytics-actions';
import {
  buildFacetBaseMetadata,
  getStateNeededForFacetMetadata,
  buildFacetSelectionChangeMetadata,
} from './facet-set-analytics-actions-utils';
import {FacetSortCriterion} from './interfaces/request';

export const logFacetShowMore = (facetId: string): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/showMore',
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );
      return client.makeFacetShowMore(metadata);
    }
  );

export const logFacetShowLess = (facetId: string): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/showLess',
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );

      return client.makeFacetShowLess(metadata);
    }
  );

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

export const logFacetUpdateSort = (
  payload: LogFacetUpdateSortActionCreatorPayload
): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/sortChange',
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

      return client.makeFacetUpdateSort(metadata);
    }
  );

export const logFacetClearAll = (facetId: string): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/reset',
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);

      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = buildFacetBaseMetadata(facetId, stateForAnalytics);

      return client.makeFacetClearAll(metadata);
    }
  );

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

export const logFacetSelect = (
  payload: LogFacetSelectActionCreatorPayload
): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/select',
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

      return client.makeFacetSelect(metadata);
    }
  );

export const logFacetExclude = (
  payload: LogFacetSelectActionCreatorPayload
): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/exclude',
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

      return client.makeFacetExclude(metadata);
    }
  );

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

export const logFacetDeselect = (
  payload: LogFacetDeselectActionCreatorPayload
): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/deselect',
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

      return client.makeFacetDeselect(metadata);
    }
  );

export const logFacetBreadcrumb = (
  payload: LogFacetBreadcrumbActionCreatorPayload
): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/facet/breadcrumb',
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });
      const metadata = buildFacetSelectionChangeMetadata(
        payload,
        getStateNeededForFacetMetadata(state)
      );

      return client.makeBreadcrumbFacet(metadata);
    }
  );
