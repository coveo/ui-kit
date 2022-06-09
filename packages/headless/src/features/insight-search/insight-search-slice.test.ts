import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {
  executeSearch,
  fetchFacetValues,
  fetchMoreResults,
} from './insight-search-actions';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {logFacetShowMore} from '../facets/facet-set/facet-set-analytics-actions';
import {getSearchInitialState, SearchState} from '../search/search-state';
import {buildMockResult} from '../../test';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {searchReducer} from '../search/search-slice';
import {buildMockSearch} from '../../test/mock-search';

describe('insight search slice', () => {
  let state: SearchState;

  beforeEach(() => {
    state = getSearchInitialState();
  });

  it('loads with an initial state', () => {
    const finalState = searchReducer(undefined, {type: ''});
    expect(finalState).toEqual(getSearchInitialState());
  });

  it('the initial isloading state is set to false', () => {
    expect(state.isLoading).toBe(false);
  });

  describe('executeSearch', () => {
    beforeEach(() => {
      state = getSearchInitialState();
    });

    it('when the action fulfilled is received, it updates the state to the received payload', () => {
      const result = buildMockResult();
      const response = buildMockSearchResponse({results: [result]});
      const insightSearchState = buildMockSearch({
        response: response,
        duration: 123,
        queryExecuted: 'foo',
      });

      const action = executeSearch.fulfilled(
        insightSearchState,
        '',
        logSearchboxSubmit()
      );
      const finalState = searchReducer(state, action);

      expect(finalState.response).toEqual(response);
      expect(finalState.duration).toEqual(123);
      expect(finalState.queryExecuted).toEqual('foo');
      expect(finalState.isLoading).toBe(false);
    });

    it('with an existing result , when the action fulfilled is received, it overwrites the old search results', () => {
      const initialResult = buildMockResult({title: 'initial result'});
      const newResult = buildMockResult({title: 'new result'});
      state.results = [initialResult];

      const finalState = searchReducer(
        state,
        executeSearch.fulfilled(
          buildMockSearch({
            response: buildMockSearchResponse({results: [newResult]}),
          }),
          '',
          logSearchboxSubmit()
        )
      );

      expect(finalState.results).toEqual([newResult]);
    });

    it('with an existing result , when the action fulfilled is received, it overwrites the #searchResponseId', () => {
      const initialResult = buildMockResult({title: 'initial result'});
      const newResult = buildMockResult({title: 'new result'});
      state.results = [initialResult];
      state.searchResponseId = 'an_initial_id';
      const response = buildMockSearchResponse({results: [newResult]});
      response.searchUid = 'a_new_id';
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        executeSearch.fulfilled(search, '', logSearchboxSubmit())
      );

      expect(finalState.searchResponseId).toBe('a_new_id');
    });

    it('when the action rejected is received with an error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {
        type: 'search/executeSearch/rejected',
        payload: err,
      };
      const finalState = searchReducer(state, action);

      expect(finalState.response).toEqual(getSearchInitialState().response);
      expect(finalState.results).toEqual([]);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toEqual(err);
    });

    it('when the action rejected is received without an error', () => {
      const action = {
        type: 'search/executeSearch/rejected',
        payload: null,
      };
      const finalState = searchReducer(state, action);

      expect(finalState.response).toEqual(getSearchInitialState().response);
      expect(finalState.results).toEqual(getSearchInitialState().results);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toEqual(null);
    });

    it('update state during executeSearch.pending', () => {
      const pendingAction = executeSearch.pending('asd', logSearchboxSubmit());
      const finalState = searchReducer(state, pendingAction);
      expect(finalState.isLoading).toBe(true);
      expect(finalState.requestId).toBe(pendingAction.meta.requestId);
    });
  });

  describe('fetchMoreResults', () => {
    beforeEach(() => {
      state = getSearchInitialState();
    });

    it('when the action fulfilled is received, it updates the state to the received payload', () => {
      state.searchResponseId = 'the_initial_id';
      const result = buildMockResult();
      const response = buildMockSearchResponse({results: [result]});
      const searchState = buildMockSearch({
        response,
        duration: 123,
        queryExecuted: 'foo',
        searchResponseId: 'a_new_id',
      });

      const action = fetchMoreResults.fulfilled(searchState, '');
      const finalState = searchReducer(state, action);

      expect(finalState.response).toEqual(response);
      expect(finalState.duration).toEqual(123);
      expect(finalState.queryExecuted).toEqual('foo');
      expect(finalState.isLoading).toBe(false);
      expect(finalState.searchResponseId).toBe('the_initial_id');
    });

    it('when a fetchMoreResults rejected is received with an error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {
        type: 'search/fetchMoreResults/rejected',
        payload: err,
      };
      const finalState = searchReducer(state, action);

      expect(finalState.response).toEqual(getSearchInitialState().response);
      expect(finalState.results).toEqual([]);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toEqual(err);
    });

    it('update state during fetchMoreResults.pending', () => {
      const pendingAction = fetchMoreResults.pending('asd');
      const finalState = searchReducer(state, pendingAction);
      expect(finalState.isLoading).toBe(true);
      expect(finalState.requestId).toBe(pendingAction.meta.requestId);
    });
  });

  describe('fetchFacetValues', () => {
    it('updates the facet state', () => {
      const response = buildMockSearchResponse({
        facets: [buildMockFacetResponse()],
      });
      const initialState = buildMockSearch({
        response,
      });
      const action = fetchFacetValues.fulfilled(
        initialState,
        '',
        logFacetShowMore('')
      );

      const finalState = searchReducer(state, action);
      expect(finalState.response.facets).toEqual(response.facets);
    });

    it('updates the searchUid, but not the searchResponseId', () => {
      const response = buildMockSearchResponse({
        facets: [buildMockFacetResponse()],
      });
      const initialState = buildMockSearch({
        response,
        searchResponseId: 'test',
      });
      const action = fetchFacetValues.fulfilled(
        initialState,
        '',
        logFacetShowMore('')
      );

      const finalState = searchReducer(state, action);
      expect(finalState.response.searchUid).toEqual(response.searchUid);
      expect(finalState.searchResponseId).not.toEqual('test');
    });
  });
});
