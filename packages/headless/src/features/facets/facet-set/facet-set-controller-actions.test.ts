import {buildMockSearchAppEngine, MockSearchEngine} from '../../../test';
import {executeToggleFacetSelect} from './facet-set-controller-actions';
import {buildMockFacetValue} from '../../../test/mock-facet-value';

describe('facet set controller actions', () => {
  let engine: MockSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleFacetSelect dispatches the correct actions', () => {
    const selection = buildMockFacetValue({value: 'test'});
    engine.dispatch(executeToggleFacetSelect({facetId, selection}));

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'facet/executeToggleSelect/pending',
      }),
      expect.objectContaining({
        type: 'facet/toggleSelectValue',
        payload: {facetId, selection},
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
