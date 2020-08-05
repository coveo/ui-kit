import {
  CategoryFacetOptions,
  CategoryFacet,
  buildCategoryFacet,
} from './headless-category-facet';
import {SearchPageState} from '../../../state';
import {MockEngine, buildMockEngine, createMockState} from '../../../test';
import {registerCategoryFacet} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response';

describe('category facet', () => {
  const facetId = '1';
  let options: CategoryFacetOptions;
  let state: SearchPageState;
  let engine: MockEngine;
  let categoryFacet: CategoryFacet;

  function initCategoryFacet() {
    engine = buildMockEngine({state});
    categoryFacet = buildCategoryFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'geography',
    };

    state = createMockState();

    initCategoryFacet();
  });

  it('registers a category facet with the passed options', () => {
    const action = registerCategoryFacet({facetId, ...options});
    expect(engine.actions).toContainEqual(action);
  });

  it('is subscribable', () => {
    expect(categoryFacet.subscribe).toBeDefined();
  });

  it('when the search response is empty, the state #values is an empty array', () => {
    expect(state.search.response.facets).toEqual([]);
    expect(categoryFacet.state.values).toEqual([]);
  });

  it('when the search response has a facet, the state #values contains the same values', () => {
    const values = [buildMockCategoryFacetValue()];
    const response = buildMockCategoryFacetResponse({facetId, values});

    state.search.response.facets = [response];
    expect(categoryFacet.state.values).toBe(values);
  });
});
