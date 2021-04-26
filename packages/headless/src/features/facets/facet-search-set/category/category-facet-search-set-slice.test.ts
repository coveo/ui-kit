import {registerCategoryFacetSearch} from './category-facet-search-actions';
import {categoryFacetSearchSetReducer} from './category-facet-search-set-slice';
import * as FacetSearchReducerHelpers from '../facet-search-reducer-helpers';
import {buildMockFacetSearchResponse} from '../../../../test/mock-facet-search-response';
import {updateFacetSearch} from '../specific/specific-facet-search-actions';
import {
  CategoryFacetSearchSetState,
  getCategoryFacetSearchSetInitialState,
} from './category-facet-search-set-state';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
} from '../../../search/search-actions';

describe('FacetSearch slice', () => {
  const facetId = '1';
  const facetSearchSetReducer = categoryFacetSearchSetReducer;

  let state: CategoryFacetSearchSetState;

  beforeEach(() => {
    state = getCategoryFacetSearchSetInitialState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSearchSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerCategoryFacetSearch calls #handleFacetSearchRegistration', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRegistration');
    facetSearchSetReducer(state, registerCategoryFacetSearch({facetId}));
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

  it('#handleFacetSearchClear calls #handleFacetSearchFulfilled', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchClear');
    facetSearchSetReducer(state, clearFacetSearch({facetId}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchClear
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeFacetSearch.fulfilled calls #handleFacetSearchSetClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const action = executeSearch.fulfilled(
      {} as ExecuteSearchThunkReturn,
      '',
      null as never
    );
    facetSearchSetReducer(state, action);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });
});
