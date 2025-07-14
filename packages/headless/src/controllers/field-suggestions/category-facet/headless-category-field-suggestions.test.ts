import type {CategoryFacetRequest} from '../../../features/facets/category-facet-set/interfaces/request.js';
import {executeFieldSuggest} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import type {SearchAppState} from '../../../state/search-app-state.js';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search.js';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCategoryFieldSuggestions,
  type CategoryFieldSuggestions,
  type CategoryFieldSuggestionsOptions,
} from './headless-category-field-suggestions.js';

vi.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);
vi.mock(
  '../../../features/facets/facet-search-set/generic/generic-facet-search-actions'
);

describe('categoryFieldSuggestions', () => {
  const facetId = 'id';
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let fieldSuggestions: CategoryFieldSuggestions;
  let options: CategoryFieldSuggestionsOptions;

  function initFacet() {
    engine = buildMockSearchEngine(state);
    fieldSuggestions = buildCategoryFieldSuggestions(engine, {options});
  }

  function setFacetRequest(config: Partial<CategoryFacetRequest> = {}) {
    const request = buildMockCategoryFacetRequest({facetId, ...config});
    state.categoryFacetSet[facetId] = buildMockCategoryFacetSlice({request});
    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch({
      initialNumberOfValues: 5,
    });
  }

  beforeEach(() => {
    options = {
      facet: {
        facetId,
        field: 'geography',
      },
    };

    state = createMockState();
    setFacetRequest();

    initFacet();
  });

  it('should dispatch an #updateFacetSearch and #executeFacetSearch action on #updateText', () => {
    fieldSuggestions.updateText('foo');
    expect(updateFacetSearch).toHaveBeenCalledWith({
      facetId,
      query: 'foo',
      numberOfValues: 5,
    });
    expect(executeFieldSuggest).toHaveBeenCalled();
  });
});
