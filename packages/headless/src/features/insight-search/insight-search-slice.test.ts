import {buildMockInsightSearch} from '../../test/mock-insight-search';
import {
  buildMockInsightQueryResponse,
  buildMockSearchResult,
} from '../../test/mock-query-response';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {insightExecuteSearch, insightFetchMoreResults} from './insight-search-actions';
import {insightSearchReducer} from './insight-search-slice';
import {
  getInsightSearchInitialState,
  InsightSearchState,
} from './insight-search-state';

describe('insight search slice', () => {
  let state: InsightSearchState;

  beforeEach(() => {
    state = getInsightSearchInitialState();
  });

  it('loads with an initial state', () => {
    const finalState = insightSearchReducer(undefined, {type: ''});
    expect(finalState).toEqual(getInsightSearchInitialState());
  });

  it('the initial isloading state is set to false', () => {
    expect(state.isLoading).toBe(false);
  });

  describe('insightExecuteSearch', () => {
    beforeEach(() => {
      state = getInsightSearchInitialState();
    });

    it('when the action fulfilled is received, it updates the state to the received payload', () => {
      const result = buildMockSearchResult();
      const response = buildMockInsightQueryResponse({results: [result]});
      const insightSearchState = buildMockInsightSearch({
        response: response,
        duration: 123,
        queryExecuted: 'foo',
      });
  
      const action = insightExecuteSearch.fulfilled(
        insightSearchState,
        '',
        logSearchboxSubmit()
      );
      const finalState = insightSearchReducer(state, action);
  
      expect(finalState.response).toEqual(response);
      expect(finalState.duration).toEqual(123);
      expect(finalState.queryExecuted).toEqual('foo');
      expect(finalState.isLoading).toBe(false);
    });

    it('when the action rejected is received with an error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {type: 'insight/search/executeSearch/rejected', payload: err};
      const finalState = insightSearchReducer(state, action);

      expect(finalState.response).toEqual(getInsightSearchInitialState().response);
      expect(finalState.results).toEqual([]);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toEqual(err);
    });
  });

  describe('insightFetchMoreResults', () => {
    beforeEach(() => {
      state = getInsightSearchInitialState();
    });

    it('when the action fulfilled is received, it updates the state to the received payload', () => {
      state.searchResponseId = 'the_initial_id';
      const result = buildMockSearchResult();
      const response = buildMockInsightQueryResponse({results: [result]});
      const searchState = buildMockInsightSearch({
        response,
        duration: 123,
        queryExecuted: 'foo',
        searchResponseId: 'a_new_id',
      });
  
      const action = insightFetchMoreResults.fulfilled(searchState, '');
      const finalState = insightSearchReducer(state, action);
  
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
      const action = {type: 'insight/search/fetchMoreResults/rejected', payload: err};
      const finalState = insightSearchReducer(state, action);

      expect(finalState.response).toEqual(getInsightSearchInitialState().response);
      expect(finalState.results).toEqual([]);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toEqual(err);
    });
  });

  describe('insightFetchFacetValues', () => {

  });
});
