import {ArrayValue} from '@coveo/bueno';
import {CategoryFacetMetadata} from 'coveo.analytics';
import {ProductListingAppState} from '../../../state/product-listing-app-state';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';
import {
  makeProductListingAnalyticsAction,
  ProductListingAction,
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
  state: Partial<ProductListingAppState>,
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
): ProductListingAction =>
  makeProductListingAnalyticsAction(
    'analytics/categoryFacet/breadcrumb',
    (client, state) => {
      validatePayload(payload, categoryFacetBreadcrumbPayloadDefinition);

      return client.makeBreadcrumbFacet(
        getCategoryFacetMetadata(state, payload)
      );
    }
  );
