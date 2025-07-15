import {Value} from '@coveo/bueno';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../../analytics/analytics-utils.js';
import {SearchPageEvents} from '../../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state.js';
import {facetIdDefinition} from '../generic/facet-actions-validation.js';
import type {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request.js';
import type {LogFacetBreadcrumbActionCreatorPayload} from './facet-set-analytics-actions.js';
import {
  buildFacetBaseMetadata,
  buildFacetSelectionChangeMetadata,
  getStateNeededForFacetMetadata,
} from './facet-set-analytics-actions-utils.js';
import type {FacetSortCriterion} from './interfaces/request.js';

export const logFacetShowMore = (facetId: string): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.facetShowMore)(
    'analytics/facet/showMore',
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = {
        ...buildFacetBaseMetadata(
          facetId,
          getStateNeededForFacetMetadata(state)
        ),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };
      return client.logFacetShowMore(metadata);
    }
  );

export const logFacetShowLess = (facetId: string): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.facetShowLess)(
    'analytics/facet/showLess',
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = {
        ...buildFacetBaseMetadata(
          facetId,
          getStateNeededForFacetMetadata(state)
        ),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logFacetShowLess(metadata);
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
  sortCriterion: FacetSortCriterion | RangeFacetSortCriterion;
}

export const logFacetUpdateSort = (
  payload: LogFacetUpdateSortActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.facetUpdateSort)(
    'analytics/facet/sortChange',
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        sortCriterion: new Value<FacetSortCriterion | RangeFacetSortCriterion>({
          required: true,
        }),
      });

      const {facetId, sortCriterion} = payload;
      const stateForAnalytics = getStateNeededForFacetMetadata(state);

      const base = buildFacetBaseMetadata(facetId, stateForAnalytics);
      const metadata = {
        ...base,
        criteria: sortCriterion,
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logFacetUpdateSort(metadata);
    }
  );

export const logFacetClearAll = (facetId: string): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.facetClearAll)(
    'analytics/facet/reset',
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);

      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = {
        ...buildFacetBaseMetadata(facetId, stateForAnalytics),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logFacetClearAll(metadata);
    }
  );

interface LogFacetSelectActionCreatorPayload {
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.facetSelect)(
    'analytics/facet/select',
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });
      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = {
        ...buildFacetSelectionChangeMetadata(payload, stateForAnalytics),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logFacetSelect(metadata);
    }
  );

interface LogFacetDeselectActionCreatorPayload {
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.facetDeselect)(
    'analytics/facet/deselect',
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });
      const stateForAnalytics = getStateNeededForFacetMetadata(state);
      const metadata = {
        ...buildFacetSelectionChangeMetadata(payload, stateForAnalytics),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logFacetDeselect(metadata);
    }
  );

export const logFacetBreadcrumb = (
  payload: LogFacetBreadcrumbActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.breadcrumbFacet)(
    'analytics/facet/breadcrumb',
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });
      const metadata = {
        ...buildFacetSelectionChangeMetadata(
          payload,
          getStateNeededForFacetMetadata(state)
        ),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logBreadcrumbFacet(metadata);
    }
  );
