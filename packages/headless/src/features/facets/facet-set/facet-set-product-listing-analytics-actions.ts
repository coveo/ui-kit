import {Value} from '@coveo/bueno';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';
import {
  AnalyticsType,
  ProductListingAction,
  makeProductListingAnalyticsAction,
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

export const logFacetShowMore = (facetId: string): ProductListingAction =>
  makeProductListingAnalyticsAction(
    'analytics/facet/showMore',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );
      return client.makeFacetShowMore(metadata);
    }
  );

export const logFacetShowLess = (facetId: string): ProductListingAction =>
  makeProductListingAnalyticsAction(
    'analytics/facet/showLess',
    AnalyticsType.Search,
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
): ProductListingAction =>
  makeProductListingAnalyticsAction(
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

      return client.makeFacetUpdateSort(metadata);
    }
  );

export const logFacetClearAll = (facetId: string): ProductListingAction =>
  makeProductListingAnalyticsAction(
    'analytics/facet/reset',
    AnalyticsType.Search,
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
): ProductListingAction =>
  makeProductListingAnalyticsAction(
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

      return client.makeFacetSelect(metadata);
    }
  );

export const logFacetExclude = (
  payload: LogFacetSelectActionCreatorPayload
): ProductListingAction =>
  makeProductListingAnalyticsAction(
    'analytics/facet/exclude',
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
): ProductListingAction =>
  makeProductListingAnalyticsAction(
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

      return client.makeFacetDeselect(metadata);
    }
  );

export const logFacetBreadcrumb = (
  payload: LogFacetBreadcrumbActionCreatorPayload
): ProductListingAction =>
  makeProductListingAnalyticsAction(
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

      return client.makeBreadcrumbFacet(metadata);
    }
  );
