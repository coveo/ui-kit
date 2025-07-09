import {getSearchApiBaseUrl} from '../../../../api/platform-client.js';
import type {CategoryFacetSearchRequest} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-request.js';
import type {NavigatorContext} from '../../../../app/navigator-context-provider.js';
import {buildSearchRequest} from '../../../search/search-request.js';
import type {CategoryFacetRequest} from '../../category-facet-set/interfaces/request.js';
import type {StateNeededForCategoryFacetSearch} from '../generic/generic-facet-search-state.js';

export const buildCategoryFacetSearchRequest = async (
  id: string,
  state: StateNeededForCategoryFacetSearch,
  navigatorContext: NavigatorContext,
  isFieldSuggestionsRequest: boolean
): Promise<CategoryFacetSearchRequest> => {
  const options = state.categoryFacetSearchSet[id].options;
  const categoryFacet = state.categoryFacetSet[id]!.request;

  const {captions, query, numberOfValues} = options;
  const {field, delimitingCharacter, basePath, filterFacetCount} =
    categoryFacet;
  const path = getPathToSelectedCategoryFacetItem(categoryFacet);
  const ignorePaths = path.length ? [path] : [];
  const newQuery = `*${query}*`;

  return {
    url:
      state.configuration.search.apiBaseUrl ??
      getSearchApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    ...(state.configuration.search.authenticationProviders.length && {
      authentication:
        state.configuration.search.authenticationProviders.join(','),
    }),
    basePath,
    captions,
    numberOfValues,
    query: newQuery,
    field,
    delimitingCharacter,
    ignorePaths,
    filterFacetCount,
    type: 'hierarchical',
    ...(isFieldSuggestionsRequest
      ? {}
      : {
          searchContext: (await buildSearchRequest(state, navigatorContext))
            .request,
        }),
  };
};

const getPathToSelectedCategoryFacetItem = (
  categoryFacet: CategoryFacetRequest
): string[] => {
  const path = [];
  let selectedValue = categoryFacet.currentValues[0];
  while (selectedValue) {
    path.push(selectedValue.value);
    selectedValue = selectedValue.children[0];
  }
  return path;
};
