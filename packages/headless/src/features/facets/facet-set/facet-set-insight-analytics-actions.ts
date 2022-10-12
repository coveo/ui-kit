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
  InsightAction,
  makeInsightAnalyticsAction,
} from '../../analytics/analytics-utils';
import {
  buildFacetBaseMetadata,
  getStateNeededForFacetMetadata,
  buildFacetSelectionChangeMetadata,
} from './facet-set-analytics-actions-utils';
import {LogFacetBreadcrumbActionCreatorPayload} from './facet-set-analytics-actions';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state';

export const logFacetShowMore = (facetId: string): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/facet/showMore',
    AnalyticsType.Search,
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
  makeInsightAnalyticsAction(
    'analytics/facet/showLess',
    AnalyticsType.Search,
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
  makeInsightAnalyticsAction(
    'analytics/facet/sortChange',
    AnalyticsType.Search,
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
  makeInsightAnalyticsAction(
    'analytics/facet/reset',
    AnalyticsType.Search,
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
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/facet/select',
    AnalyticsType.Search,
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
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/facet/deselect',
    AnalyticsType.Search,
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
  makeInsightAnalyticsAction(
    'analytics/facet/breadcrumb',
    AnalyticsType.Search,
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
