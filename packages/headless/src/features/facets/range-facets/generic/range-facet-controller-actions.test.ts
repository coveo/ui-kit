import {buildMockSearchAppEngine, MockSearchEngine} from '../../../../test.js';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import {
  executeToggleRangeFacetExclude,
  executeToggleRangeFacetSelect,
} from './range-facet-controller-actions.js';

describe('range facet controller actions', () => {
  let engine: MockSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleRangeFacetSelect dispatches the correct actions', () => {
    const selection = buildMockNumericFacetValue();
    engine.dispatch(executeToggleRangeFacetSelect({facetId, selection}));

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'rangeFacet/executeToggleSelect',
      }),
    ]);
  });

  it('#executeToggleRangeFacetExclude dispatches the correct actions', () => {
    const selection = buildMockNumericFacetValue();
    engine.dispatch(executeToggleRangeFacetExclude({facetId, selection}));

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'rangeFacet/executeToggleExclude',
      }),
    ]);
  });
});
