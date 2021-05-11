import {ArrayValue} from '@coveo/bueno';
import {CategoryFacetMetadata} from 'coveo.analytics/src/searchPage/searchPageEvents';
import {SearchAppState} from '../../../state/search-app-state';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';
import {
  AnalyticsType,
  makeAnalyticsAction,
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

/**
 * Logs a category facet breadcrumb event.
 * @param payload (LogCategoryFacetBreadcrumbActionCreatorPayload) Object specifying the target facet and path.
 */
export const logCategoryFacetBreadcrumb = (
  payload: LogCategoryFacetBreadcrumbActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/categoryFacet/breadcrumb',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, categoryFacetBreadcrumbPayloadDefinition);

      return client.logBreadcrumbFacet(
        getCategoryFacetMetadata(state, payload)
      );
    }
  )();
