import {PlatformClient} from '../../api/platform-client';
import {Result} from '../../api/search/search/result';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {buildMockQuestionsAnswers} from '../../test/mock-question-answer';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {createMockState} from '../../test/mock-state';
import {makeAnalyticsAction} from '../analytics/analytics-utils';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {logFacetShowMore} from '../facets/facet-set/facet-set-analytics-actions';
import {logPageNext} from '../pagination/pagination-analytics-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
  fetchFacetValues,
  fetchMoreResults,
  fetchPage,
} from './search-actions';
import {searchReducer} from './search-slice';
import {
  emptyQuestionAnswer,
  getSearchInitialState,
  SearchState,
} from './search-state';

jest.mock('../../api/platform-client');

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

      const action = executeSearch.fulfilled(
        searchState,
        '',
        logSearchboxSubmit()
      );
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

      const action = fetchPage.fulfilled(searchState, '', logPageNext());
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
          logSearchboxSubmit()
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
        executeSearch.fulfilled(search, '', logSearchboxSubmit())
      );

      expect(finalState.searchResponseId).toBe('a_new_id');
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
        executeSearch.fulfilled(search, '', logSearchboxSubmit())
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

    it('when a fetchMoreResults fulfilled is received, it updates the #extendedResults', () => {
      state.extendedResults = {
        generativeQuestionAnsweringId: 'an_initial_id',
      };
      const response = buildMockSearchResponse({results: [newResult]});
      const expected = {
        generativeQuestionAnsweringId: 'a_new_id',
      };
      response.extendedResults = expected;
      const search = buildMockSearch({
        response,
      });

      const finalState = searchReducer(
        state,
        fetchMoreResults.fulfilled(search, '')
      );

      expect(finalState.extendedResults).toBe(expected);
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

    beforeEach(() => (state = initialMockState()));

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
      const action = executeSearch.fulfilled(
        searchState,
        '',
        logSearchboxSubmit()
      );
      const finalState = searchReducer(state, action);
      expect(finalState.error).toBeNull();
    });

    it('when a fetchMore fulfilled is received', () => {
      const action = fetchMoreResults.fulfilled(searchState, '');
      const finalState = searchReducer(state, action);
      expect(finalState.error).toBeNull();
    });

    it('when a fetchPage fulfilled is received', () => {
      const action = fetchPage.fulfilled(searchState, '', logPageNext());
      const finalState = searchReducer(state, action);
      expect(finalState.error).toBeNull();
    });
  });

  describe('should dispatch a logQueryError action', () => {
    let e: MockSearchEngine;
    beforeEach(() => {
      e = buildMockSearchAppEngine({state: createMockState()});
      PlatformClient.call = jest.fn().mockImplementation(() => {
        const body = JSON.stringify({
          message: 'message',
          statusCode: 500,
          type: 'type',
        });
        const response = new Response(body);

        return Promise.resolve(response);
      });
    });

    it('on a executeSearch error', async () => {
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).toContainEqual(
        expect.objectContaining({
          type: 'search/queryError/pending',
        })
      );
    });

    it('on a fetchMoreResults error', async () => {
      await e.dispatch(fetchMoreResults());
      expect(e.actions).toContainEqual(
        expect.objectContaining({
          type: 'search/queryError/pending',
        })
      );
    });

    it('on a fetchPage error', async () => {
      await e.dispatch(fetchPage(logPageNext()));
      expect(e.actions).toContainEqual(
        expect.objectContaining({
          type: 'search/queryError/pending',
        })
      );
    });
  });

  it('set the isloading state to true during executeSearch.pending', () => {
    const pendingAction = executeSearch.pending('asd', logSearchboxSubmit());
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('set the isloading state to true during fetchMoreResults.pending', () => {
    const pendingAction = fetchMoreResults.pending('asd');
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('set the isloading state to true during fetchPage.pending', () => {
    const pendingAction = fetchPage.pending('asd', logPageNext());
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('update the requestId during executeSearch.pending', () => {
    const pendingAction = executeSearch.pending('asd', logSearchboxSubmit());
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.requestId).toBe(pendingAction.meta.requestId);
  });

  it('update the requestId during fetchMoreResults.pending', () => {
    const pendingAction = fetchMoreResults.pending('asd');
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.requestId).toBe(pendingAction.meta.requestId);
  });

  it('update the requestId during fetchPage.pending', () => {
    const pendingAction = fetchPage.pending('asd', logPageNext());
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.requestId).toBe(pendingAction.meta.requestId);
  });

  describe('when did you mean is enabled and a search is executed', () => {
    let e: MockSearchEngine;

    beforeEach(() => {
      const state = createMockState();
      state.didYouMean.enableDidYouMean = true;
      state.query.q = 'boo';
      e = buildMockSearchAppEngine({state});
    });

    it('should retry the query automatically when corrections are available and there is no result', async () => {
      PlatformClient.call = jest.fn().mockImplementation(() => {
        const payload = buildMockSearchResponse({
          results: [],
          queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
        });

        const body = JSON.stringify(payload);
        const response = new Response(body);

        return Promise.resolve(response);
      });

      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).toContainEqual({
        type: applyDidYouMeanCorrection.type,
        payload: 'foo',
      });
    });

    describe('when retrying query automatically', () => {
      let analyticsStateQuerySpy: jest.Mock;
      const queryCorrections = [{correctedQuery: 'foo', wordCorrections: []}];
      beforeEach(async () => {
        analyticsStateQuerySpy = jest.fn();
        const mockLogSubmit = () =>
          makeAnalyticsAction('analytics/test', (_, state) =>
            analyticsStateQuerySpy(state.query?.q)
          );

        const fetched = () => {
          const payload = buildMockSearchResponse({
            results: [],
            queryCorrections,
          });

          const body = JSON.stringify(payload);
          const response = new Response(body);

          return Promise.resolve(response);
        };
        const retried = () => {
          const payload = buildMockSearchResponse({
            results: [],
            queryCorrections: [],
          });

          const body = JSON.stringify(payload);
          const response = new Response(body);

          return Promise.resolve(response);
        };

        PlatformClient.call = jest
          .fn()
          .mockImplementationOnce(fetched)
          .mockImplementationOnce(retried);
        await e.dispatch(executeSearch(mockLogSubmit()));
      });

      it('should log the original query to the executeSearch analytics action', () => {
        expect(analyticsStateQuerySpy).toHaveBeenCalledWith('boo');
      });

      it('should return the queryCorrections from the original fetched response', () => {
        const fulfilledSearchAction = e.actions.find(
          (action) => action.type === executeSearch.fulfilled.type
        );
        expect(
          fulfilledSearchAction!.payload.response.queryCorrections
        ).toEqual(queryCorrections);
      });
    });

    it('should not retry the query automatically when corrections are available and results are available', async () => {
      PlatformClient.call = jest.fn().mockImplementation(() =>
        Promise.resolve({
          body: buildMockSearchResponse({
            results: [buildMockResult()],
            queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
          }),
        })
      );
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).not.toContainEqual({
        type: applyDidYouMeanCorrection.type,
        payload: 'foo',
      });
    });

    it('should not retry the query automatically when no corrections are available and no results are available', async () => {
      PlatformClient.call = jest.fn().mockImplementation(() =>
        Promise.resolve({
          body: buildMockSearchResponse({
            results: [],
            queryCorrections: [],
          }),
        })
      );
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).not.toContainEqual({
        type: applyDidYouMeanCorrection.type,
      });
    });
  });

  describe('when a fetchFacetValues fulfilled is received', () => {
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
