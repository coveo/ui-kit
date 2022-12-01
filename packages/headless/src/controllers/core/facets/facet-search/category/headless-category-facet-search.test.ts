import {
  registerCategoryFacetSearch,
  selectCategoryFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {defaultFacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search';
import {buildMockCategoryFacetSearchResult} from '../../../../../test/mock-category-facet-search-result';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../../../test/mock-engine';
import {
  CategoryFacetSearchProps,
  CategoryFacetSearch,
  buildCoreCategoryFacetSearch,
} from './headless-category-facet-search';

describe('CategoryFacetSearch', () => {
  const facetId = '1';
  let props: CategoryFacetSearchProps;
  let engine: MockSearchEngine;
  let controller: CategoryFacetSearch;

  function initEngine() {
    engine = buildMockSearchAppEngine();
    engine.state.categoryFacetSearchSet[facetId] =
      buildMockCategoryFacetSearch();
  }

  function initFacetSearch() {
    controller = buildCoreCategoryFacetSearch(engine, props);
  }

  beforeEach(() => {
    props = {
      options: {
        ...defaultFacetSearchOptions,
        facetId,
      },
      isForFieldSuggestions: false,
    };

    initEngine();
    initFacetSearch();
  });

  it('on init, it dispatches a #registerCategoryFacetSearch action with the specified options', () => {
    expect(engine.actions).toContainEqual(
      registerCategoryFacetSearch(props.options)
    );
  });

  it('calling #state returns the latest state', () => {
    engine.state.categoryFacetSearchSet[facetId].isLoading = true;
    expect(controller.state.isLoading).toBe(true);
  });

  describe('#select', () => {
    const value = buildMockCategoryFacetSearchResult();

    beforeEach(() => {
      controller.select(value);
    });

    it('dispatches #selectCategoryFacetSearchResult action', () => {
      const action = selectCategoryFacetSearchResult({
        facetId,
        value,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('if numberOfValues is set it dispatches #selectCategoryFacetSearchResult with the correct retrieveCount', () => {
      props.options.numberOfValues = 3;
      initFacetSearch();
      const action = selectCategoryFacetSearchResult({
        facetId,
        value,
      });
      expect(engine.actions).toContainEqual(action);
    });
  });
});
