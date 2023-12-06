import {ArrayValue} from '@coveo/bueno';
import type {CategoryFacetMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAppState} from '../../../state/search-app-state';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  SearchAction,
} from '../../analytics/analytics-utils';
import {facetIdDefinition} from '../generic/facet-actions-validation';

export interface LogCategoryFacetBreadcrumbActionCreatorPayload {
  /**
   * The category facet id.
   */
  categoryFacetId: string;

  /**
   * The category facet selected path.
   */
  categoryFacetPath: string[];
}

const categoryFacetBreadcrumbPayloadDefinition = {
  categoryFacetId: facetIdDefinition,
  categoryFacetPath: new ArrayValue({
    required: true,
    each: requiredNonEmptyString,
  }),
};

const getCategoryFacetMetadata = (
  state: Partial<SearchAppState>,
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

//TODO: KIT-2859
export const logCategoryFacetBreadcrumb = (
  payload: LogCategoryFacetBreadcrumbActionCreatorPayload
): SearchAction =>
  makeAnalyticsAction('analytics/categoryFacet/breadcrumb', (client, state) => {
    validatePayload(payload, categoryFacetBreadcrumbPayloadDefinition);

    return client.makeBreadcrumbFacet(getCategoryFacetMetadata(state, payload));
  });
