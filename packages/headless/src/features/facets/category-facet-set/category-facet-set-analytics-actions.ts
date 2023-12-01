import {ArrayValue} from '@coveo/bueno';
import type {CategoryFacetMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAnalyticsProvider} from '../../../api/analytics/search-analytics';
import {SearchAppState} from '../../../state/search-app-state';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../analytics/analytics-utils';
import {SearchPageEvents} from '../../analytics/search-action-cause';
import {SearchAction} from '../../search/search-actions';
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
): LegacySearchAction =>
  makeAnalyticsAction('analytics/categoryFacet/breadcrumb', (client, state) => {
    validatePayload(payload, categoryFacetBreadcrumbPayloadDefinition);

    return client.makeBreadcrumbFacet(getCategoryFacetMetadata(state, payload));
  });

export const categoryBreadcrumbFacet = (
  id: string,
  path: string[]
): SearchAction => {
  return {
    actionCause: SearchPageEvents.breadcrumbFacet,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(
        () => state
      ).getCategoryFacetBreadcrumbMetadata(id, path),
  };
};
