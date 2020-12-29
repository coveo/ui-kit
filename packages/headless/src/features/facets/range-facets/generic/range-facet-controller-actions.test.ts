import {buildMockSearchAppEngine, MockEngine} from '../../../../test';
import {SearchAppState} from '../../../../state/search-app-state';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {executeToggleRangeFacetSelect} from './range-facet-controller-actions';

describe('range facet controller actions', () => {
  let engine: MockEngine<SearchAppState>;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleRangeFacetSelect dispatches the correct actions', () => {
    const selection = buildMockNumericFacetValue();
    engine.dispatch(executeToggleRangeFacetSelect({facetId, selection}));

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'rangeFacet/executeToggleSelect/pending',
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
