import {MockSearchEngine} from '../../../test/mock-engine';
import {buildMockSearchAppEngine} from '../../../test/mock-engine';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {
  executeToggleFacetExclude,
  executeToggleFacetSelect,
} from './facet-set-controller-actions';

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
    ]);
  });

  it('#executeToggleExclude dispatches the correct actions', () => {
    const selection = buildMockFacetValue({value: 'test'});
    engine.dispatch(executeToggleFacetExclude({facetId, selection}));

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'facet/executeToggleExclude/pending',
      }),
      expect.objectContaining({
        type: 'facet/toggleExcludeValue',
        payload: {facetId, selection},
      }),
      expect.objectContaining({
        type: 'facetOptions/update',
        payload: {freezeFacetOrder: true},
      }),
    ]);
  });
});
