import {buildMockSearchAppEngine, MockSearchEngine} from '../../../../test';
import {executeToggleDateFacetSelect} from './date-facet-controller-actions';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';

describe('date facet controller actions', () => {
  let engine: MockSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleDateFacetSelect dispatches the correct actions', () => {
    const selection = buildMockDateFacetValue();
    engine.dispatch(executeToggleDateFacetSelect({facetId, selection}));

    expect(engine.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'dateFacet/toggleSelectValue',
          payload: {facetId, selection},
        }),
        expect.objectContaining({
          type: 'rangeFacet/executeToggleSelect/pending',
        }),
      ])
    );
  });
});
