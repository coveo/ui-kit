import {CategoryFacetRequest} from '../../../features/facets/category-facet-set/interfaces/request';
import {executeFieldSuggest} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {SearchAppState} from '../../../state/search-app-state';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {
  buildCategoryFieldSuggestions,
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsOptions,
} from './headless-category-field-suggestions';

jest.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);
jest.mock(
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
