import {buildMockSearchAppEngine, MockEngine} from '../../../../test';
import {SearchAppState} from '../../../../state/search-app-state';
import {executeToggleNumericFacetSelect} from './numeric-facet-controller-actions';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';

describe('numeric facet controller actions', () => {
  let engine: MockEngine<SearchAppState>;
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
          type: 'rangeFacet/executeToggleSelect/pending',
        }),
      ])
    );
  });
});
