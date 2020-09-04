import {
  registerFacetSearch,
  updateFacetSearch,
  executeFacetSearch,
} from './specific-facet-search-actions';
import {
  SpecificFacetSearchSetState,
  specificFacetSearchSetReducer,
  getFacetSearchSetInitialState,
} from './specific-facet-search-set-slice';
import * as FacetSearchReducerHelpers from '../facet-search-reducer-helpers';
import {buildMockFacetSearchResponse} from '../../../../test/mock-facet-search-response';

describe('FacetSearch slice', () => {
  const facetId = '1';
  const facetSearchSetReducer = specificFacetSearchSetReducer;

  let state: SpecificFacetSearchSetState;

  beforeEach(() => {
    state = getFacetSearchSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSearchSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerFacetSearch calls #handleFacetSearchRegistration', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRegistration');
    facetSearchSetReducer(state, registerFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchRegistration
    ).toHaveBeenCalledTimes(1);
  });

  it('#updateFacetSearch calls #handleFacetSearchUpdate', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchUpdate');
    facetSearchSetReducer(state, updateFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchUpdate
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeFacetSearch.pending calls #handleFacetSearchPending', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
    const pendingAction = executeFacetSearch.pending(facetId, '');
    facetSearchSetReducer(state, pendingAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchPending
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeFacetSearch.rejected calls #handleFacetSearchRejected', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRejected');
    const rejectedAction = executeFacetSearch.rejected(
      {name: 'test', message: 'test'},
      facetId,
      facetId
    );
    facetSearchSetReducer(state, rejectedAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchRejected
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeFacetSearch.fulfilled with an unregistered id, it does nothing', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchFulfilled');
    const response = buildMockFacetSearchResponse();
    const action = executeFacetSearch.fulfilled({facetId, response}, '', '');

    facetSearchSetReducer(state, action);
    expect(
      FacetSearchReducerHelpers.handleFacetSearchFulfilled
    ).toHaveBeenCalledTimes(1);
  });
});
