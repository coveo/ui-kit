import {
  buildMockSearchAppEngine,
  MockEngine,
} from '../../../../test/mock-engine';
import {
  registerCategoryFacetSearch,
  selectCategoryFacetSearchResult,
} from '../../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {
  CategoryFacetSearchProps,
  CategoryFacetSearch,
  buildCategoryFacetSearch,
} from './headless-category-facet-search';
import {buildMockCategoryFacetSearch} from '../../../../test/mock-category-facet-search';
import {buildMockCategoryFacetSearchResult} from '../../../../test/mock-category-facet-search-result';
import {executeSearch} from '../../../../features/search/search-actions';
import {SearchAppState} from '../../../../state/search-app-state';
import {defaultFacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-reducer-helpers';

describe('CategoryFacetSearch', () => {
  const facetId = '1';
  let props: CategoryFacetSearchProps;
  let engine: MockEngine<SearchAppState>;
  let controller: CategoryFacetSearch;

  function initEngine() {
    engine = buildMockSearchAppEngine();
    engine.state.categoryFacetSearchSet[
      facetId
    ] = buildMockCategoryFacetSearch();
  }

  function initFacetSearch() {
    controller = buildCategoryFacetSearch(engine, props);
  }

  beforeEach(() => {
    props = {
      options: {
        ...defaultFacetSearchOptions,
        facetId,
      },
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
        retrieveCount: defaultFacetSearchOptions.numberOfValues,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('if numberOfValues is set it dispatches #selectCategoryFacetSearchResult with the correct retrieveCount', () => {
      props.options.numberOfValues = 3;
      initFacetSearch();
      const action = selectCategoryFacetSearchResult({
        facetId,
        value,
        retrieveCount: defaultFacetSearchOptions.numberOfValues,
      });
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #executeSearch action', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
