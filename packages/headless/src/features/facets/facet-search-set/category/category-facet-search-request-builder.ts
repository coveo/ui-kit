import {CategoryFacetSearchRequest} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-request';
import {buildSearchRequest} from '../../../search/search-request';
import {CategoryFacetRequest} from '../../category-facet-set/interfaces/request';
import {StateNeededForCategoryFacetSearch} from '../generic/generic-facet-search-state';

export const buildCategoryFacetSearchRequest = async (
  id: string,
  state: StateNeededForCategoryFacetSearch
): Promise<CategoryFacetSearchRequest> => {
  const options = state.categoryFacetSearchSet[id].options;
  const categoryFacet = state.categoryFacetSet[id]!.request;

  const {captions, query, numberOfValues} = options;
  const {field, delimitingCharacter, basePath, filterFacetCount} =
    categoryFacet;
  const searchContext = (await buildSearchRequest(state)).request;
  const path = getPathToSelectedCategoryFacetItem(categoryFacet);
  const ignorePaths = path.length ? [path] : [];
  const newQuery = `*${query}*`;

  return {
    url: state.configuration.search.apiBaseUrl,
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    basePath,
    captions,
    numberOfValues,
    query: newQuery,
    field,
    delimitingCharacter,
    ignorePaths,
    searchContext,
    filterFacetCount,
    type: 'hierarchical',
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
