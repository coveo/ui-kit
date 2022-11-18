import {buildMockSearchAppEngine, MockSearchEngine} from '../../../../test';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {executeToggleNumericFacetSelect} from './numeric-facet-controller-actions';

describe('numeric facet controller actions', () => {
  let engine: MockSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleNumericFacet dispatches the correct actions', () => {
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
});
