import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {commerceFacetSetReducer} from '../facet-set/facet-set-slice.js';
import type {CommerceFacetSetState} from '../facet-set/facet-set-state.js';
import {loadLocationFacetActions} from './location-facet-actions-loader.js';

describe('#loadLocationFacetActions', () => {
  it('adds the commerce facet set reducer to the engine', () => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());

    loadLocationFacetActions(engine);

    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceFacetSet: commerceFacetSetReducer,
    });
  });

  it('returns a #toggleSelectLocationFacetValue action that leaves the facet set unchanged', () => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());
    const {toggleSelectLocationFacetValue} = loadLocationFacetActions(engine);
    const facetId = 'some-facet';
    const state: CommerceFacetSetState = {
      [facetId]: buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({facetId}),
      }),
    };

    const finalState = commerceFacetSetReducer(
      state,
      toggleSelectLocationFacetValue({
        facetId,
        selection: {value: 'Montreal', state: 'idle'},
      })
    );

    expect(finalState).toBe(state);
  });
});
