import type {CategoryFacetRequest} from '../features/facets/category-facet-set/interfaces/request.js';

export function buildMockCategoryFacetRequest(
  config: Partial<CategoryFacetRequest> = {}
): CategoryFacetRequest {
  return {
    facetId: '',
    field: '',
    currentValues: [],
    filterFacetCount: false,
    delimitingCharacter: '|',
    injectionDepth: 1000,
    numberOfValues: 5,
    preventAutoSelect: false,
    sortCriteria: 'occurrences',
    resultsMustMatch: 'atLeastOneValue',
    type: 'hierarchical',
    basePath: [],
    filterByBasePath: false,
    ...config,
  };
}
