import {buildSearchResponse} from '../../../../../test/mock-commerce-search.js';
import {buildMockFacetSearchResponse} from '../../../../../test/mock-facet-search-response.js';
import {buildFetchProductListingResponse} from '../../../../../test/mock-product-listing.js';
import {setView} from '../../../../commerce/context/context-actions.js';
import * as FacetSearchReducerHelpers from '../../../../facets/facet-search-set/facet-search-reducer-helpers.js';
import {clearFacetSearch} from '../../../../facets/facet-search-set/generic/generic-facet-search-actions.js';
import {
  registerFacetSearch,
  updateFacetSearch,
} from '../../../../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {
  getFacetSearchSetInitialState,
  type SpecificFacetSearchSetState,
} from '../../../../facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {fetchProductListing} from '../../../product-listing/product-listing-actions.js';
import {fetchQuerySuggestions} from '../../../query-suggest/query-suggest-actions.js';
import {executeSearch as executeCommerceSearch} from '../../../search/search-actions.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../commerce-facet-search-actions.js';
import * as CommerceFacetSearchReducerHelpers from '../commerce-facet-search-reducer-helpers.js';
import {commerceSpecificFacetSearchSetReducer} from './commerce-specific-facet-search-set-slice.js';

describe('Commerce SpecificFacetSearchSet slice', () => {
  const facetId = '1';
  const facetSearchSetReducer = commerceSpecificFacetSearchSetReducer;

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

  it('on #executeCommerceFieldSuggest.pending, calls #handleFacetSearchPending', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
    const pendingAction = executeCommerceFieldSuggest.pending(facetId, {
      facetId,
      facetSearchType: 'SEARCH',
    });
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

  it('on #executeCommerceFieldSuggest.rejected, calls #handleFacetSearchRejected', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRejected');
    const rejectedAction = executeCommerceFieldSuggest.rejected(
      {name: 'test', message: 'test'},
      facetId,
      {facetId, facetSearchType: 'SEARCH'}
    );
    facetSearchSetReducer(state, rejectedAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchRejected
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceFacetSearch.fulfilled, calls #handleCommerceFacetSearchFulfilled', () => {
    vi.spyOn(
      CommerceFacetSearchReducerHelpers,
      'handleCommerceFacetSearchFulfilled'
    );
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
      CommerceFacetSearchReducerHelpers.handleCommerceFacetSearchFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('on #executeCommerceFieldSuggest.fulfilled, calls #handleCommerceFacetFieldSuggestionsFulfilled', () => {
    vi.spyOn(
      CommerceFacetSearchReducerHelpers,
      'handleCommerceFacetFieldSuggestionsFulfilled'
    );
    const response = buildMockFacetSearchResponse();
    const action = executeCommerceFieldSuggest.fulfilled(
      {facetId, response: {success: response}},
      '',
      {facetId: '', facetSearchType: 'SEARCH'}
    );

    facetSearchSetReducer(state, action);
    expect(
      CommerceFacetSearchReducerHelpers.handleCommerceFacetFieldSuggestionsFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('on #fetchQuerySuggestions.fulfilled, calls #handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet', () => {
    vi.spyOn(
      CommerceFacetSearchReducerHelpers,
      'handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet'
    );
    const action = fetchQuerySuggestions.fulfilled(
      {
        id: '',
        completions: [],
        responseId: 'responseId',
        query: 'abc',
        fieldSuggestionsFacets: [],
      },
      '',
      {
        id: '',
      }
    );

    facetSearchSetReducer(state, action);
    expect(
      CommerceFacetSearchReducerHelpers.handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet
    ).toHaveBeenCalledTimes(1);
  });

  it('on #clearFacetSearch, calls #handleFacetSearchClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchClear');
    facetSearchSetReducer(state, clearFacetSearch({facetId}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchClear
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
