import {MockSearchEngine} from '../../../../test/mock-engine';
import {buildMockSearchAppEngine} from '../../../../test/mock-engine';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {
  executeToggleNumericFacetSelect,
  executeToggleNumericFacetExclude,
} from './numeric-facet-controller-actions';

describe('numeric facet controller actions', () => {
  let engine: MockSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleNumericFacetSelect dispatches the correct actions', () => {
    const selection = buildMockNumericFacetValue();
    engine.dispatch(executeToggleNumericFacetSelect({facetId, selection}));

    expect(engine.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'numericFacet/toggleSelectValue',
          payload: {facetId, selection},
        }),
        expect.objectContaining({
          type: 'rangeFacet/executeToggleSelect',
        }),
        expect.objectContaining({
          type: 'facetOptions/update',
          payload: {freezeFacetOrder: true},
        }),
      ])
    );
  });

  it('#executeToggleNumericFacetExclude dispatches the correct actions', () => {
    const selection = buildMockNumericFacetValue();
    engine.dispatch(executeToggleNumericFacetExclude({facetId, selection}));

    expect(engine.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'numericFacet/toggleExcludeValue',
          payload: {facetId, selection},
        }),
        expect.objectContaining({
          type: 'rangeFacet/executeToggleExclude',
        }),
        expect.objectContaining({
          type: 'facetOptions/update',
          payload: {freezeFacetOrder: true},
        }),
      ])
    );
  });
});
