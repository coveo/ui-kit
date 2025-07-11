import {buildSearchResponse} from '../../../../test/mock-commerce-search.js';
import {buildMockFacetSearchResponse} from '../../../../test/mock-facet-search-response.js';
import {buildFetchProductListingResponse} from '../../../../test/mock-product-listing.js';
import {setView} from '../../../commerce/context/context-actions.js';
import {executeCommerceFacetSearch} from '../../../commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {fetchProductListing} from '../../../commerce/product-listing/product-listing-actions.js';
import {executeSearch as executeCommerceSearch} from '../../../commerce/search/search-actions.js';
import {
  type ExecuteSearchThunkReturn,
  executeSearch,
} from '../../../search/search-actions.js';
import * as FacetSearchReducerHelpers from '../facet-search-reducer-helpers.js';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions.js';
import {
  registerFacetSearch,
  updateFacetSearch,
} from './specific-facet-search-actions.js';
import {specificFacetSearchSetReducer} from './specific-facet-search-set-slice.js';
import {
  getFacetSearchSetInitialState,
  type SpecificFacetSearchSetState,
} from './specific-facet-search-set-state.js';

describe('FacetSearch slice', () => {
  const facetId = '1';
  const facetSearchSetReducer = specificFacetSearchSetReducer;

  let state: SpecificFacetSearchSetState;

  beforeEach(() => {
    vi.resetAllMocks();
    state = getFacetSearchSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSearchSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('on #registerFacetSearch, calls #handleFacetSearchRegistration', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRegistration');
    facetSearchSetReducer(state, registerFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchRegistration
    ).toHaveBeenCalledTimes(1);
  });

  it('on #updateFacetSearch, calls #handleFacetSearchUpdate', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchUpdate');
    facetSearchSetReducer(state, updateFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchUpdate
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceFacetSearch.pending, calls #handleFacetSearchPending', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
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
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
    const pendingAction = executeFacetSearch.pending(facetId, '');
    facetSearchSetReducer(state, pendingAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchPending
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceFacetSearch.rejected, calls #handleFacetSearchRejected', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRejected');
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
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRejected');
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
    vi.spyOn(FacetSearchReducerHelpers, 'handleCommerceFacetSearchFulfilled');
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
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchFulfilled');
    const response = buildMockFacetSearchResponse();
    const action = executeFacetSearch.fulfilled({facetId, response}, '', '');

    facetSearchSetReducer(state, action);
    expect(
      FacetSearchReducerHelpers.handleFacetSearchFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('on #clearFacetSearch, calls #handleFacetSearchClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchClear');
    facetSearchSetReducer(state, clearFacetSearch({facetId}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeSearch.fulfilled, calls #handleFacetSearchSetClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const action = executeSearch.fulfilled({} as ExecuteSearchThunkReturn, '', {
      legacy: null as never,
    });
    facetSearchSetReducer(state, action);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #fetchProductListing.fulfilled, calls #handleFacetSearchSetClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const response = buildFetchProductListingResponse();
    facetSearchSetReducer(state, fetchProductListing.fulfilled(response, ''));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceSearch.fulfilled, calls #handleFacetSearchSetClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const response = buildSearchResponse();
    facetSearchSetReducer(state, executeCommerceSearch.fulfilled(response, ''));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('on #setView, calls #handleFacetSearchSetClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    facetSearchSetReducer(state, setView({url: ''}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });
});
