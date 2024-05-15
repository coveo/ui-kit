import {executeCommerceFieldSuggest} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {CategoryFacetRequest} from '../../../features/commerce/facets/facet-set/interfaces/request';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetSlice} from '../../../test/mock-commerce-facet-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {CategoryFacetOptions} from '../core/facets/category/headless-commerce-category-facet';
import {
  buildCategoryFieldSuggestions,
  CategoryFieldSuggestions,
} from './headless-category-field-suggestions';

jest.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);
jest.mock(
  '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);

describe('categoryFieldSuggestions', () => {
  const facetId = 'id';
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let fieldSuggestions: CategoryFieldSuggestions;
  let options: CategoryFacetOptions;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    fieldSuggestions = buildCategoryFieldSuggestions(engine, options);
  }

  function setFacetRequest(config: Partial<CategoryFacetRequest> = {}) {
    const request = buildMockCommerceFacetRequest({facetId, ...config});
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({request});
    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch({
      initialNumberOfValues: 5,
    });
  }

  beforeEach(() => {
    options = {
      facetId,
      fetchProductsActionCreator: jest.fn(),
      facetResponseSelector: jest.fn(),
      isFacetLoadingResponseSelector: jest.fn(),
    };

    state = buildMockCommerceState();
    setFacetRequest();

    initFacet();
  });

  it('should dispatch an #updateFacetSearch and #executeFieldSuggest action on #updateText', () => {
    fieldSuggestions.updateText('foo');
    expect(updateFacetSearch).toHaveBeenCalledWith({
      facetId,
      query: 'foo',
      numberOfValues: 5,
    });
    expect(executeCommerceFieldSuggest).toHaveBeenCalled();
  });
});
