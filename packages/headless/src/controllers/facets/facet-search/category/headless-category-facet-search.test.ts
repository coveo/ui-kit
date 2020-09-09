import {buildMockEngine, MockEngine} from '../../../../test/mock-engine';
import {registerCategoryFacetSearch} from '../../../../features/facets/facet-search-set/category/category-facet-search-actions';
import {
  CategoryFacetSearchProps,
  CategoryFacetSearch,
  buildCategoryFacetSearch,
} from './headless-category-facet-search';
import {buildMockCategoryFacetSearch} from '../../../../test/mock-category-facet-search';

describe('CategoryFacetSearch', () => {
  const facetId = '1';
  let props: CategoryFacetSearchProps;
  let engine: MockEngine;
  let controller: CategoryFacetSearch;

  function initEngine() {
    engine = buildMockEngine();
    engine.state.categoryFacetSearchSet[
      facetId
    ] = buildMockCategoryFacetSearch();
  }

  function initFacetSearch() {
    controller = buildCategoryFacetSearch(engine, props);
  }

  beforeEach(() => {
    props = {
      options: {facetId},
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
});
