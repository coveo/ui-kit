import {CoreEngine} from '../../../../../app/engine.js';
import {
  registerCategoryFacetSearch,
  selectCategoryFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/category/category-facet-search-actions.js';
import {defaultFacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-reducer-helpers.js';
import {
  CategoryFacetSearchSection,
  ConfigurationSection,
} from '../../../../../state/state-sections.js';
import {buildMockCategoryFacetSearchResult} from '../../../../../test/mock-category-facet-search-result.js';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search.js';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../../../test/mock-engine-v2.js';
import {createMockState} from '../../../../../test/mock-state.js';
import {
  CategoryFacetSearchProps,
  CategoryFacetSearch,
  buildCoreCategoryFacetSearch,
} from './headless-category-facet-search.js';

jest.mock(
  '../../../../../features/facets/facet-search-set/category/category-facet-search-actions'
);

describe('CategoryFacetSearch', () => {
  const facetId = '1';
  let props: CategoryFacetSearchProps;
  let engine: MockedSearchEngine;
  let controller: CategoryFacetSearch;

  function initEngine() {
    const state = createMockState();
    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch();
    engine = buildMockSearchEngine(state);
  }

  function initFacetSearch() {
    controller = buildCoreCategoryFacetSearch(
      engine as CoreEngine<CategoryFacetSearchSection & ConfigurationSection>,
      props
    );
  }

  beforeEach(() => {
    props = {
      options: {
        ...defaultFacetSearchOptions,
        facetId,
      },
      executeFacetSearchActionCreator: jest.fn(),
      executeFieldSuggestActionCreator: jest.fn(),
      select: jest.fn(),
      isForFieldSuggestions: false,
    };

    initEngine();
    initFacetSearch();
  });

  it('on init, it dispatches a #registerCategoryFacetSearch action with the specified options', () => {
    expect(registerCategoryFacetSearch).toHaveBeenCalledWith(props.options);
  });

  describe('#select', () => {
    const value = buildMockCategoryFacetSearchResult();

    beforeEach(() => {
      controller.select(value);
    });

    it('dispatches #selectCategoryFacetSearchResult action', () => {
      expect(selectCategoryFacetSearchResult).toHaveBeenCalledWith({
        facetId,
        value,
      });
    });

    it('if numberOfValues is set it dispatches #selectCategoryFacetSearchResult with the correct retrieveCount', () => {
      props.options.numberOfValues = 3;
      initFacetSearch();
      expect(selectCategoryFacetSearchResult).toHaveBeenCalledWith({
        facetId,
        value,
      });
    });
  });
});
