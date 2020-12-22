import {buildMockSearchAppEngine, MockEngine} from '../../../test';
import {SearchAppState} from '../../../state/search-app-state';
import {executeToggleFacetSelect} from './facet-set-controller-actions';
import {buildMockFacetValue} from '../../../test/mock-facet-value';

describe('facet set controller actions', () => {
  let engine: MockEngine<SearchAppState>;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#executeToggleFacetSelect dispatches the correct actions', () => {
    const selection = buildMockFacetValue();
    engine.dispatch(executeToggleFacetSelect({facetId, selection}));

    expect(engine.actions).toEqual([
      expect.objectContaining({
        type: 'facet/executeToggleSelect',
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
