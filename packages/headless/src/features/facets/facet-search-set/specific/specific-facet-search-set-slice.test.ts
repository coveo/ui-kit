import {buildSearchResponse} from '../../../../test/mock-commerce-search';
import {buildMockFacetSearchResponse} from '../../../../test/mock-facet-search-response';
import {buildFetchProductListingResponse} from '../../../../test/mock-product-listing';
import {setView} from '../../../commerce/context/context-actions';
import {executeCommerceFacetSearch} from '../../../commerce/facets/facet-search-set/commerce-facet-search-actions';
import {fetchProductListing} from '../../../commerce/product-listing/product-listing-actions';
import {executeSearch as executeCommerceSearch} from '../../../commerce/search/search-actions';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
} from '../../../search/search-actions';
import * as FacetSearchReducerHelpers from '../facet-search-reducer-helpers';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';
import {
  registerFacetSearch,
  updateFacetSearch,
} from './specific-facet-search-actions';
import {specificFacetSearchSetReducer} from './specific-facet-search-set-slice';
import {
  getFacetSearchSetInitialState,
  SpecificFacetSearchSetState,
} from './specific-facet-search-set-state';

describe('FacetSearch slice', () => {
  const facetId = '1';
  const facetSearchSetReducer = specificFacetSearchSetReducer;

  let state: SpecificFacetSearchSetState;

  beforeEach(() => {
    jest.resetAllMocks();
    state = getFacetSearchSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSearchSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('on #registerFacetSearch, calls #handleFacetSearchRegistration', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRegistration');
    facetSearchSetReducer(state, registerFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchRegistration
    ).toHaveBeenCalledTimes(1);
  });

  it('on #updateFacetSearch, calls #handleFacetSearchUpdate', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchUpdate');
    facetSearchSetReducer(state, updateFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchUpdate
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceFacetSearch.pending, calls #handleFacetSearchPending', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
    const pendingAction = executeCommerceFacetSearch.pending(facetId, {
      facetId,
      facetSearchType: 'SEARCH',
    });
    facetSearchSetReducer(state, pendingAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchPending
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeFacetSearch.pending, calls #handleFacetSearchPending', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
    const pendingAction = executeFacetSearch.pending(facetId, '');
    facetSearchSetReducer(state, pendingAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchPending
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceFacetSearch.rejected, calls #handleFacetSearchRejected', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRejected');
    const rejectedAction = executeCommerceFacetSearch.rejected(
      {name: 'test', message: 'test'},
      facetId,
      {facetId, facetSearchType: 'SEARCH'}
    );
    facetSearchSetReducer(state, rejectedAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchRejected
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeFacetSearch.rejected, calls #handleFacetSearchRejected', () => {
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

  it('on #executeCommerceFacetSearch.fulfilled, calls #handleCommerceFacetSearchFulfilled', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleCommerceFacetSearchFulfilled');
    const response = buildMockFacetSearchResponse();

    const action = executeCommerceFacetSearch.fulfilled(
      {
        facetId,
        response: {
          success: response,
        },
      },
      '',
      {facetId: '', facetSearchType: 'SEARCH'}
    );

    facetSearchSetReducer(state, action);
    expect(
      FacetSearchReducerHelpers.handleCommerceFacetSearchFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeFacetSearch.fulfilled, calls #handleFacetSearchFulfilled', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchFulfilled');
    const response = buildMockFacetSearchResponse();
    const action = executeFacetSearch.fulfilled({facetId, response}, '', '');

    facetSearchSetReducer(state, action);
    expect(
      FacetSearchReducerHelpers.handleFacetSearchFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('on #clearFacetSearch, calls #handleFacetSearchClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchClear');
    facetSearchSetReducer(state, clearFacetSearch({facetId}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeSearch.fulfilled, calls #handleFacetSearchSetClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const action = executeSearch.fulfilled({} as ExecuteSearchThunkReturn, '', {
      legacy: null as never,
    });
    facetSearchSetReducer(state, action);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #fetchProductListing.fulfilled, calls #handleFacetSearchSetClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const response = buildFetchProductListingResponse();
    facetSearchSetReducer(state, fetchProductListing.fulfilled(response, ''));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceSearch.fulfilled, calls #handleFacetSearchSetClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const response = buildSearchResponse();
    facetSearchSetReducer(state, executeCommerceSearch.fulfilled(response, ''));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #setView, calls #handleFacetSearchSetClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    facetSearchSetReducer(state, setView({url: ''}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });
});
