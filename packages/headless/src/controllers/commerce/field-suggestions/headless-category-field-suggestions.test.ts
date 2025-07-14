import {
  executeCommerceFacetSearch,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import type {CategoryFacetRequest} from '../../../features/commerce/facets/facet-set/interfaces/request.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search.js';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceFacetSlice} from '../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import type {CategoryFacetOptions} from '../core/facets/category/headless-commerce-category-facet.js';
import {
  buildCategoryFieldSuggestions,
  type CategoryFieldSuggestions,
} from './headless-category-field-suggestions.js';

vi.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);

vi.mock(
  '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);

describe('categoryFieldSuggestions', () => {
  const facetId = 'id';
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let fieldSuggestions: CategoryFieldSuggestions;
  let options: CategoryFacetOptions;

  function initFieldSuggestions() {
    engine = buildMockCommerceEngine(state);
    fieldSuggestions = buildCategoryFieldSuggestions(engine, options);
  }

  function setFacetRequest(config: Partial<CategoryFacetRequest> = {}) {
    const request = buildMockCommerceFacetRequest({facetId, ...config});
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({request});
    state.categoryFacetSearchSet[
      getFacetIdWithCommerceFieldSuggestionNamespace(facetId)
    ] = buildMockCategoryFacetSearch({
      initialNumberOfValues: 5,
    });
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      facetId,
      fetchProductsActionCreator: vi.fn(),
      facetResponseSelector: vi.fn(),
      isFacetLoadingResponseSelector: vi.fn(),
      facetSearch: {type: 'SEARCH'},
    };

    state = buildMockCommerceState();
    setFacetRequest();

    initFieldSuggestions();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      fieldSuggestionsOrder,
      categoryFacetSearchSet,
      commerceFacetSet,
    });
  });

  it('should dispatch an #updateFacetSearch and #executeFieldSuggest action on #updateText', () => {
    fieldSuggestions.updateText('foo');
    expect(updateFacetSearch).toHaveBeenCalledWith({
      facetId: getFacetIdWithCommerceFieldSuggestionNamespace(facetId),
      query: 'foo',
      numberOfValues: 5,
    });
    expect(executeCommerceFacetSearch).toHaveBeenCalled();
  });
});
