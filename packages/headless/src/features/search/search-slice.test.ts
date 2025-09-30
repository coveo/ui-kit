import type {Result} from '../../api/search/search/result.js';
import {buildMockFacetResponse} from '../../test/mock-facet-response.js';
import {buildMockQuestionsAnswers} from '../../test/mock-question-answer.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearch} from '../../test/mock-search.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {setError} from '../error/error-actions.js';
import {logFacetShowMore} from '../facets/facet-set/facet-set-analytics-actions.js';
import {logPageNext} from '../pagination/pagination-analytics-actions.js';
import {logSearchboxSubmit} from '../query/query-analytics-actions.js';
import {
  type ExecuteSearchThunkReturn,
  executeSearch,
  fetchFacetValues,
  fetchMoreResults,
  fetchPage,
} from './search-actions.js';
import {searchReducer} from './search-slice.js';
import {
  emptyQuestionAnswer,
  getSearchInitialState,
  type SearchState,
} from './search-state.js';

describe('search-slice', () => {
  let state: SearchState;

  beforeEach(() => {
    state = getSearchInitialState();
  });

  it('loads with an initial state', () => {
    const finalState = searchReducer(undefined, {type: ''});
    expect(finalState).toEqual(getSearchInitialState());
  });

  it('the initial response #totalCountFiltered is 0', () => {
    expect(state.response.totalCountFiltered).toBe(0);
  });

  it('the initial isloading state is set to false', () => {
    expect(state.isLoading).toBe(false);
  });

  describe('with no existing result (first search)', () => {
    it('when a executeSearch fulfilled is received, it updates the state to the received payload', () => {
      const result = buildMockResult();
      const response = buildMockSearchResponse({results: [result]});
      const searchState = buildMockSearch({
        response,
        duration: 123,
        queryExecuted: 'foo',
      });

      const action = executeSearch.fulfilled(searchState, '', {
        legacy: logSearchboxSubmit(),
      });
      const finalState = searchReducer(state, action);

      expect(finalState.response).toEqual(response);
      expect(finalState.duration).toEqual(123);
      expect(finalState.queryExecuted).toEqual('foo');
      expect(finalState.isLoading).toBe(false);
    });

    it('when a fetchMoreResults fulfilled is received, it updates the state to the received payload', () => {
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

    it('when a fetchPage fulfilled is received, it updates the state to the received payload', () => {
      state.searchResponseId = 'the_initial_id';
      const result = buildMockResult();
      const response = buildMockSearchResponse({results: [result]});
      const searchState = buildMockSearch({
        response,
        duration: 123,
        queryExecuted: 'foo',
        searchResponseId: 'a_new_id',
      });

      const action = fetchPage.fulfilled(searchState, '', {
        legacy: logPageNext(),
      });
      const finalState = searchReducer(state, action);

      expect(finalState.response).toEqual(response);
      expect(finalState.duration).toEqual(123);
      expect(finalState.queryExecuted).toEqual('foo');
      expect(finalState.isLoading).toBe(false);
      expect(finalState.searchResponseId).toBe('the_initial_id');
    });
  });

  describe('with an existing result', () => {
    let initialResult: Result;
    let newResult: Result;
    beforeEach(() => {
      initialResult = buildMockResult({title: 'initial result'});
      newResult = buildMockResult({title: 'new result'});
      state.results = [initialResult];
    });

    it('when a executeSearch fulfilled is received, it overwrites the old search results', () => {
      const finalState = searchReducer(
        state,
        executeSearch.fulfilled(
          buildMockSearch({
            response: buildMockSearchResponse({results: [newResult]}),
          }),
          '',
          {legacy: logSearchboxSubmit()}
        )
      );

      expect(finalState.results).toEqual([newResult]);
    });

    it('when a executeSearch fulfilled is received, it overwrites the #searchResponseId', () => {
      state.searchResponseId = 'an_initial_id';
      const response = buildMockSearchResponse({results: [newResult]});
      response.searchUid = 'a_new_id';
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        executeSearch.fulfilled(search, '', {legacy: logSearchboxSubmit()})
      );

      expect(finalState.searchResponseId).toBe('a_new_id');
    });

    it('when a executeSearch fulfilled is received, results should contain last #searchUid', () => {
      state.searchResponseId = 'an_initial_id';
      const response = buildMockSearchResponse({results: [newResult]});
      response.searchUid = 'a_new_id';
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        executeSearch.fulfilled(search, '', {legacy: logSearchboxSubmit()})
      );

      expect(finalState.results[0].searchUid).toBe('a_new_id');
    });

    it('when a executeSearch fulfilled is received, it overwrites the #questionAnswer', () => {
      state.questionAnswer = buildMockQuestionsAnswers({
        question: 'When?',
      });
      const response = buildMockSearchResponse({
        results: [newResult],
        questionAnswer: buildMockQuestionsAnswers({
          question: 'Who?',
        }),
      });
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        executeSearch.fulfilled(search, '', {legacy: logSearchboxSubmit()})
      );

      expect(finalState.questionAnswer).toEqual(response.questionAnswer);
    });

    it('when a fetchMoreResults fulfilled is received, it appends the new search results', () => {
      const finalState = searchReducer(
        state,
        fetchMoreResults.fulfilled(
          buildMockSearch({
            response: buildMockSearchResponse({results: [newResult]}),
          }),
          ''
        )
      );

      expect(finalState.results).toEqual([initialResult, newResult]);
    });

    it('when a fetchMoreResults fulfilled is received, keeps the previous #searchResponseId', () => {
      state.searchResponseId = 'an_initial_id';
      const response = buildMockSearchResponse({results: [newResult]});
      response.searchUid = 'a_new_id';
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        fetchMoreResults.fulfilled(search, '')
      );

      expect(finalState.searchResponseId).toBe('an_initial_id');
    });

    it('when a fetchMoreResults fulfilled is received, previous results keep their #searchUiD', () => {
      state.results = state.results.map((result) => ({
        ...result,
        searchUid: 'an_initial_id',
      }));
      const response = buildMockSearchResponse({results: [newResult]});
      response.searchUid = 'a_new_id';
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        fetchMoreResults.fulfilled(search, '')
      );

      expect(finalState.results[0].searchUid).toBe('an_initial_id');
      expect(finalState.results[1].searchUid).toBe('a_new_id');
    });

    it('when a fetchPage fulfilled is received, new results should contain the latest search #searchUid', () => {
      state.results = state.results.map((result) => ({
        ...result,
        searchUid: 'an_initial_id',
      }));
      const response = buildMockSearchResponse({results: [newResult]});
      response.searchUid = 'a_new_id';
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        fetchPage.fulfilled(search, '', {legacy: logPageNext()})
      );

      expect(finalState.results[0].searchUid).toBe('a_new_id');
    });

    it('when a fetchMoreResults fulfilled is received, keeps the previous #questionAnswer', () => {
      const originalQuestionAnswers = buildMockQuestionsAnswers({
        question: 'Why?',
      });
      state.questionAnswer = originalQuestionAnswers;
      const search = buildMockSearch({
        response: buildMockSearchResponse({results: [newResult]}),
      });

      const finalState = searchReducer(
        state,
        fetchMoreResults.fulfilled(search, '')
      );

      expect(finalState.questionAnswer).toEqual(originalQuestionAnswers);
    });
  });

  describe('handles rejected searches correctly', () => {
    const results = [buildMockResult()];
    const questionAnswer = buildMockQuestionsAnswers({question: 'What?'});
    const initialMockState = () =>
      buildMockSearchState({
        results,
        response: buildMockSearchResponse({results, questionAnswer}),
        questionAnswer,
      });

    beforeEach(() => {
      state = initialMockState();
    });

    function expectStateResets(finalState: SearchState) {
      expect(finalState.response).toEqual(getSearchInitialState().response);
      expect(finalState.results).toEqual([]);
      expect(finalState.questionAnswer).toEqual(emptyQuestionAnswer());
      expect(finalState.isLoading).toBe(false);
    }

    function expectStatePreserved(finalState: SearchState) {
      expect(finalState.response).toEqual(initialMockState().response);
      expect(finalState.results).toEqual(initialMockState().results);
      expect(finalState.questionAnswer).toEqual(
        initialMockState().questionAnswer
      );
      expect(finalState.isLoading).toBe(false);
      expect(finalState.error).toEqual(null);
    }

    it('when a executeSearch rejected is received with an error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {type: 'search/executeSearch/rejected', payload: err};
      const finalState = searchReducer(state, action);

      expectStateResets(finalState);
      expect(finalState.error).toEqual(err);
    });

    it('when a fetchMoreResults rejected is received with an error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {type: 'search/fetchMoreResults/rejected', payload: err};
      const finalState = searchReducer(state, action);

      expectStateResets(finalState);
      expect(finalState.error).toEqual(err);
    });

    it('when a fetchPage rejected is received with an error', () => {
      const err = {
        message: 'message',
        statusCode: 500,
        type: 'type',
      };
      const action = {type: 'search/fetchPage/rejected', payload: err};
      const finalState = searchReducer(state, action);

      expectStateResets(finalState);
      expect(finalState.error).toEqual(err);
    });

    it('when a executeSearch rejected is received without an error', () => {
      const action = {type: 'search/executeSearch/rejected', payload: null};
      const finalState = searchReducer(state, action);

      expectStatePreserved(finalState);
      expect(finalState.error).toEqual(null);
    });

    it('when a fetchMoreResults rejected is received without an error', () => {
      const action = {type: 'search/fetchMoreResults/rejected', payload: null};
      const finalState = searchReducer(state, action);

      expectStatePreserved(finalState);
      expect(finalState.error).toEqual(null);
    });

    it('when a fetchPage rejected is received without an error', () => {
      const action = {type: 'search/fetchPage/rejected', payload: null};
      const finalState = searchReducer(state, action);

      expectStatePreserved(finalState);
      expect(finalState.error).toEqual(null);
    });
  });

  describe('reset error to null', () => {
    let searchState: ExecuteSearchThunkReturn;
    beforeEach(() => {
      const err = {message: 'message', statusCode: 500, type: 'type'};
      state.error = err;

      const result = buildMockResult();
      const response = buildMockSearchResponse({results: [result]});
      searchState = buildMockSearch({
        response,
        duration: 123,
        queryExecuted: 'foo',
      });
    });

    it('when a executeSearch fulfilled is received', () => {
      const action = executeSearch.fulfilled(searchState, '', {
        legacy: logSearchboxSubmit(),
      });
      const finalState = searchReducer(state, action);
      expect(finalState.error).toBeNull();
    });

    it('when a fetchMore fulfilled is received', () => {
      const action = fetchMoreResults.fulfilled(searchState, '');
      const finalState = searchReducer(state, action);
      expect(finalState.error).toBeNull();
    });

    it('when a fetchPage fulfilled is received', () => {
      const action = fetchPage.fulfilled(searchState, '', {
        legacy: logPageNext(),
      });
      const finalState = searchReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  it('set the isloading state to true during executeSearch.pending', () => {
    const pendingAction = executeSearch.pending('asd', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('set the isloading state to true during fetchMoreResults.pending', () => {
    const pendingAction = fetchMoreResults.pending('asd');
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('set the isloading state to true during fetchPage.pending', () => {
    const pendingAction = fetchPage.pending('asd', {legacy: logPageNext()});
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('set the search action cause during executeSearch.pending', () => {
    const pendingAction = executeSearch.pending('asd', {
      legacy: logSearchboxSubmit(),
      next: {actionCause: SearchPageEvents.searchboxSubmit},
    });
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.searchAction?.actionCause).toBe(
      SearchPageEvents.searchboxSubmit
    );
  });

  it('set the search action cause during fetchMoreResults.pending', () => {
    const pendingAction = fetchMoreResults.pending('asd');
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.searchAction?.actionCause).toBe(
      SearchPageEvents.browseResults
    );
  });

  it('set the search action cause during fetchPage.pending', () => {
    const pendingAction = fetchPage.pending('asd', {
      legacy: logPageNext(),
      next: {actionCause: SearchPageEvents.browseResults},
    });
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.searchAction?.actionCause).toBe(
      SearchPageEvents.browseResults
    );
  });

  it('update the requestId during executeSearch.pending', () => {
    const pendingAction = executeSearch.pending('asd', {
      legacy: logSearchboxSubmit(),
    });
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.requestId).toBe(pendingAction.meta.requestId);
  });

  it('update the requestId during fetchMoreResults.pending', () => {
    const pendingAction = fetchMoreResults.pending('asd');
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.requestId).toBe(pendingAction.meta.requestId);
  });

  it('update the requestId during fetchPage.pending', () => {
    const pendingAction = fetchPage.pending('asd', {legacy: logPageNext()});
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.requestId).toBe(pendingAction.meta.requestId);
  });

  describe('when a fetchFacetValues fulfilled is received', () => {
    it('updates the facet state', () => {
      const response = buildMockSearchResponse({
        facets: [buildMockFacetResponse()],
      });
      const initialState = buildMockSearch({
        response,
      });
      const action = fetchFacetValues.fulfilled(initialState, '', {
        legacy: logFacetShowMore(''),
      });

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
      const action = fetchFacetValues.fulfilled(initialState, '', {
        legacy: logFacetShowMore(''),
      });

      const finalState = searchReducer(state, action);
      expect(finalState.response.searchUid).toEqual(response.searchUid);
      expect(finalState.searchResponseId).not.toEqual('test');
    });
  });

  it('should set the error state and set isLoading to false on setError', () => {
    const error = {
      message: 'Something went wrong',
      statusCode: 401,
      status: 401,
      type: 'BadRequest',
    };
    const finalState = searchReducer(state, setError(error));
    expect(finalState.error).toEqual(error);
    expect(finalState.isLoading).toBe(false);
  });
});
