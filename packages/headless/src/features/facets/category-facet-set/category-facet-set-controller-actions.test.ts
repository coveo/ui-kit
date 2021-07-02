import {
  executeDeselectAllCategoryFacetValues,
  executeToggleCategoryFacetSelect,
} from './category-facet-set-controller-actions';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockSearchAppEngine, MockSearchEngine} from '../../../test';

describe('category facet controller actions', () => {
  let engine: MockSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleCategoryFacetSelect dispatches the correct actions', () => {
    const selection = buildMockCategoryFacetValue({value: 'test'});
    engine.dispatch(
      executeToggleCategoryFacetSelect({
        facetId,
        selection,
        retrieveCount: 1,
      })
    );

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'categoryFacetController/executeToggleSelect/pending',
      }),
      expect.objectContaining({
        type: 'categoryFacet/toggleSelectValue',
        payload: {facetId, selection, retrieveCount: 1},
      }),
      expect.objectContaining({
        type: 'facetOptions/update',
        payload: {freezeFacetOrder: true},
      }),
      expect.objectContaining({
        type: 'search/executeSearch/pending',
      }),
    ]);
  });

  it('#executeDeselectAllCategoryFacetValues dispatches the correct actions', () => {
    engine.dispatch(executeDeselectAllCategoryFacetValues({facetId}));

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'categoryFacetController/executeDeselectAll/pending',
      }),
      expect.objectContaining({
        type: 'categoryFacet/deselectAll',
        payload: facetId,
      }),
      expect.objectContaining({
        type: 'facetOptions/update',
        payload: {freezeFacetOrder: true},
      }),
      expect.objectContaining({
        type: 'search/executeSearch/pending',
      }),
    ]);
  });
});
