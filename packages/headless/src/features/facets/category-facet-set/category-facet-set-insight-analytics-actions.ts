import {ArrayValue} from '@coveo/bueno';
import type {CategoryFacetMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents.js';
import {InsightAppState} from '../../../state/insight-app-state.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
} from '../../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state.js';
import {facetIdDefinition} from '../generic/facet-actions-validation.js';
import {LogCategoryFacetBreadcrumbActionCreatorPayload} from './category-facet-set-analytics-actions.js';

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
  makeInsightAnalyticsAction(
    'analytics/categoryFacet/breadcrumb',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, categoryFacetBreadcrumbPayloadDefinition);
      const metadata = {
        ...getCategoryFacetMetadata(state, payload),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      };

      return client.logBreadcrumbFacet(metadata);
    }
  );
