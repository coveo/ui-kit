import {
  BaseFacetSearchRequest,
  FacetSearchType,
} from '../base/base-facet-search-request';
import {SearchPageState} from '../../../../state';
import {searchRequest} from '../../search/search-request';

export interface CategoryFacetSearchRequest
  extends BaseFacetSearchRequest,
    FacetSearchType<'hierarchical'> {
  basePath: string[];
  ignorePaths: string[][];
}

export const buildCategoryFacetSearchRequest = (
  id: string,
  state: SearchPageState
): CategoryFacetSearchRequest => {
  const options = state.categoryFacetSearchSet[id].options;
  const categoryFacet = state.categoryFacetSet[id];

  const {captions, query, numberOfValues} = options;
  const {field, delimitingCharacter, basePath} = categoryFacet;
  const searchContext = searchRequest(state);

  return {
    basePath,
    captions,
    numberOfValues,
    query,
    field,
    delimitingCharacter,
    ignorePaths: [],
    searchContext,
    type: 'hierarchical',
  };
};
