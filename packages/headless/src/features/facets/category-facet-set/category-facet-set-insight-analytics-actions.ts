import {ArrayValue} from '@coveo/bueno';
import type {CategoryFacetMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents.js';
import type {InsightAppState} from '../../../state/insight-app-state.js';
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
import type {LogCategoryFacetBreadcrumbActionCreatorPayload} from './category-facet-set-analytics-actions.js';

const categoryFacetBreadcrumbPayloadDefinition = {
  categoryFacetId: facetIdDefinition,
  categoryFacetPath: new ArrayValue({
    required: true,
    each: requiredNonEmptyString,
  }),
};

const getCategoryFacetMetadata = (
  state: Partial<InsightAppState>,
  {
    categoryFacetId,
    categoryFacetPath,
  }: LogCategoryFacetBreadcrumbActionCreatorPayload
): CategoryFacetMetadata => {
  const facet = state.categoryFacetSet![categoryFacetId]!;
  const categoryFacetField = facet?.request.field;
  const categoryFacetTitle = `${categoryFacetField}_${categoryFacetId}`;
  return {
    categoryFacetId,
    categoryFacetPath,
    categoryFacetField,
    categoryFacetTitle,
  };
};

export const logCategoryFacetBreadcrumb = (
  payload: LogCategoryFacetBreadcrumbActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.breadcrumbFacet)(
    'analytics/categoryFacet/breadcrumb',
    (client, state) => {
      validatePayload(payload, categoryFacetBreadcrumbPayloadDefinition);
      const metadata = {
        ...getCategoryFacetMetadata(state, payload),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logBreadcrumbFacet(metadata);
    }
  );
