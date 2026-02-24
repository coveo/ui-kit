import {buildMockFacetSearchResponse} from '../../../../../test/mock-facet-search-response.js';
import {registerCategoryFacetSearch} from '../../../../facets/facet-search-set/category/category-facet-search-actions.js';
import {
  type CategoryFacetSearchSetState,
  getCategoryFacetSearchSetInitialState,
} from '../../../../facets/facet-search-set/category/category-facet-search-set-state.js';
import * as FacetSearchReducerHelpers from '../../../../facets/facet-search-set/facet-search-reducer-helpers.js';
import {clearFacetSearch} from '../../../../facets/facet-search-set/generic/generic-facet-search-actions.js';
import {updateFacetSearch} from '../../../../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {
  fetchProductListing,
  type QueryCommerceAPIThunkReturn,
} from '../../../product-listing/product-listing-actions.js';
import {fetchQuerySuggestions} from '../../../query-suggest/query-suggest-actions.js';
import {
  executeSearch as executeCommerceSearch,
  type QuerySearchCommerceAPIThunkReturn,
} from '../../../search/search-actions.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../commerce-facet-search-actions.js';
import {commerceCategoryFacetSearchSetReducer} from './commerce-category-facet-search-set-slice.js';

describe('Commerce CategoryFacetSearchSet slice', () => {
  const facetId = '1';
  const facetSearchSetReducer = commerceCategoryFacetSearchSetReducer;

  let state: CategoryFacetSearchSetState;

  beforeEach(() => {
    vi.clearAllMocks();
    state = getCategoryFacetSearchSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = facetSearchSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerCategoryFacetSearch calls #handleFacetSearchRegistration', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRegistration');
    facetSearchSetReducer(state, registerCategoryFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchRegistration
    ).toHaveBeenCalledTimes(1);
  });

  it('#updateFacetSearch calls #handleFacetSearchUpdate', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchUpdate');
    facetSearchSetReducer(state, updateFacetSearch({facetId}));
    expect(
      FacetSearchReducerHelpers.handleFacetSearchUpdate
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeCommerceFacetSearch.pending calls #handleFacetSearchPending', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
    const pendingAction = executeCommerceFacetSearch.pending(facetId, {
      facetId: '',
      facetSearchType: 'SEARCH',
    });
    facetSearchSetReducer(state, pendingAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchPending
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeCommerceFieldSuggest.pending calls #handleFacetSearchPending', () => {
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

  it('#executeCommerceFacetSearch.rejected calls #handleFacetSearchRejected', () => {
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

  it('#executeCommerceFieldSuggest.rejected calls #handleFacetSearchRejected', () => {
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

  it('#executeCommerceFacetSearch.fulfilled calls #handleCommerceFacetSearchFulfilled', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleCommerceFacetSearchFulfilled');
    const response = buildMockFacetSearchResponse();
    const action = executeCommerceFacetSearch.fulfilled(
      {facetId, response: {success: response}},
      '',
      {facetId: '', facetSearchType: 'SEARCH'}
    );

    facetSearchSetReducer(state, action);
    expect(
      FacetSearchReducerHelpers.handleCommerceFacetSearchFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeCommerceFieldSuggest.fulfilled calls #handleCommerceFacetFieldSuggestionsFulfilled', () => {
    vi.spyOn(
      FacetSearchReducerHelpers,
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
      FacetSearchReducerHelpers.handleCommerceFacetFieldSuggestionsFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('#fetchQuerySuggestions.fulfilled calls #handleCommerceFetchQuerySuggestionsFulfilledForCategoryFacet', () => {
    vi.spyOn(
      FacetSearchReducerHelpers,
      'handleCommerceFetchQuerySuggestionsFulfilledForCategoryFacet'
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
      FacetSearchReducerHelpers.handleCommerceFetchQuerySuggestionsFulfilledForCategoryFacet
    ).toHaveBeenCalledTimes(1);
  });

  it('#clearFacetSearch calls #handleFacetSearchClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchClear');
    facetSearchSetReducer(state, clearFacetSearch({facetId}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchClear
    ).toHaveBeenCalledTimes(1);
  });

  it('#fetchProductListing.fulfilled calls #handleFacetSearchSetClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const action = fetchProductListing.fulfilled(
      {} as QueryCommerceAPIThunkReturn,
      ''
    );
    facetSearchSetReducer(state, action);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeCommerceSearch.fulfilled calls #handleFacetSearchSetClear', () => {
    vi.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const action = executeCommerceSearch.fulfilled(
      {} as QuerySearchCommerceAPIThunkReturn,
      ''
    );
    facetSearchSetReducer(state, action);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });
});
