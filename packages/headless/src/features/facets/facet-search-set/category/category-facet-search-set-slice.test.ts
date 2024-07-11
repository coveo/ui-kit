import {buildMockFacetSearchResponse} from '../../../../test/mock-facet-search-response';
import {QueryCommerceAPIThunkReturn} from '../../../commerce/common/actions';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../commerce/facets/facet-search-set/commerce-facet-search-actions';
import {fetchProductListing} from '../../../commerce/product-listing/product-listing-actions';
import {fetchQuerySuggestions} from '../../../commerce/query-suggest/query-suggest-actions';
import {
  executeSearch as executeCommerceSearch,
  QuerySearchCommerceAPIThunkReturn,
} from '../../../commerce/search/search-actions';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
} from '../../../search/search-actions';
import * as FacetSearchReducerHelpers from '../facet-search-reducer-helpers';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';
import {updateFacetSearch} from '../specific/specific-facet-search-actions';
import {registerCategoryFacetSearch} from './category-facet-search-actions';
import {categoryFacetSearchSetReducer} from './category-facet-search-set-slice';
import {
  CategoryFacetSearchSetState,
  getCategoryFacetSearchSetInitialState,
} from './category-facet-search-set-state';

describe('CategoryFacetSearchSet slice', () => {
  const facetId = '1';
  const facetSearchSetReducer = categoryFacetSearchSetReducer;

  let state: CategoryFacetSearchSetState;

  beforeEach(() => {
    jest.clearAllMocks();
    state = getCategoryFacetSearchSetInitialState();
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

  it('#executeCommerceFacetSearch.pending calls #handleFacetSearchPending', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
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
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchPending');
    const pendingAction = executeCommerceFieldSuggest.pending(facetId, {
      facetId,
      facetSearchType: 'SEARCH',
    });
    facetSearchSetReducer(state, pendingAction);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchPending
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

  it('#executeCommerceFacetSearch.rejected calls #handleFacetSearchRejected', () => {
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

  it('#executeCommerceFieldSuggest.rejected calls #handleFacetSearchRejected', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchRejected');
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

  it('#executeCommerceFacetSearch.fulfilled calls #handleCommerceFacetSearchFulfilled', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleCommerceFacetSearchFulfilled');
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
    jest.spyOn(
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
    jest.spyOn(
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

  it('#executeFacetSearch.fulfilled calls #handleFacetSearchFulfilled', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchFulfilled');
    const response = buildMockFacetSearchResponse();
    const action = executeFacetSearch.fulfilled({facetId, response}, '', '');

    facetSearchSetReducer(state, action);
    expect(
      FacetSearchReducerHelpers.handleFacetSearchFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  it('#clearFacetSearch calls #handleFacetSearchClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchClear');
    facetSearchSetReducer(state, clearFacetSearch({facetId}));

    expect(
      FacetSearchReducerHelpers.handleFacetSearchClear
    ).toHaveBeenCalledTimes(1);
  });

  it('#fetchProductListing.fulfilled calls #handleFacetSearchSetClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
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
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const action = executeCommerceSearch.fulfilled(
      {} as QuerySearchCommerceAPIThunkReturn,
      ''
    );
    facetSearchSetReducer(state, action);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });

  it('#executeSearch.fulfilled calls #handleFacetSearchSetClear', () => {
    jest.spyOn(FacetSearchReducerHelpers, 'handleFacetSearchSetClear');
    const action = executeSearch.fulfilled({} as ExecuteSearchThunkReturn, '', {
      legacy: null as never,
    });
    facetSearchSetReducer(state, action);

    expect(
      FacetSearchReducerHelpers.handleFacetSearchSetClear
    ).toHaveBeenCalledTimes(1);
  });
});
