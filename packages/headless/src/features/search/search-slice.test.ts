import {searchReducer} from './search-slice';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearch} from '../../test/mock-search';
import {executeSearch, fetchMoreResults} from './search-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {PlatformClient} from '../../api/platform-client';
import {createMockState} from '../../test/mock-state';
import {
  emptyQuestionAnswer,
  getSearchInitialState,
  SearchState,
} from './search-state';
import {SearchAppState} from '../../state/search-app-state';
import {Result} from '../../api/search/search/result';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';
import {Response} from 'cross-fetch';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {QuestionsAnswers} from '../../api/search/search/question-answering';

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

  it('when a execute search fulfilled is received, it shims the content of #questionAnswer if not available', () => {
    const response = buildMockSearchResponse();
    delete (response as Partial<SearchResponseSuccess>).questionAnswer;
    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', null as never);
    const finalState = searchReducer(state, action);
    expect(finalState.response.questionAnswer).toBeDefined();
    expect(finalState.response.questionAnswer).toMatchObject(
      emptyQuestionAnswer()
    );
  });

  it('when a execute search fulfilled is received, it shims the content of #questionAnswer if partially available', () => {
    const response = buildMockSearchResponse();
    response.questionAnswer.question = 'foo';
    response.questionAnswer.answerSnippet = 'bar';
    delete (response.questionAnswer as Partial<QuestionsAnswers>).documentId;
    delete (response.questionAnswer as Partial<QuestionsAnswers>)
      .relatedQuestions;

    const searchState = buildMockSearch({
      response,
    });

    const action = executeSearch.fulfilled(searchState, '', null as never);
    const finalState = searchReducer(state, action);
    expect(finalState.response.questionAnswer.question).toBe('foo');
    expect(finalState.response.questionAnswer.answerSnippet).toBe('bar');
    expect(finalState.response.questionAnswer.documentId).toMatchObject({
      ...emptyQuestionAnswer().documentId,
    });
    expect(finalState.response.questionAnswer.relatedQuestions).toBeDefined();
    expect(finalState.response.questionAnswer.relatedQuestions.length).toEqual(
      emptyQuestionAnswer().relatedQuestions.length
    );
  });

  it('when a fetchMoreResults fulfilled is received, it updates the state to the received payload', () => {
    const result = buildMockResult();
    const response = buildMockSearchResponse({results: [result]});
    const searchState = buildMockSearch({
      response,
      duration: 123,
      queryExecuted: 'foo',
    });

    const action = fetchMoreResults.fulfilled(searchState, '');
    const finalState = searchReducer(state, action);

    expect(finalState.response).toEqual(response);
    expect(finalState.duration).toEqual(123);
    expect(finalState.queryExecuted).toEqual('foo');
    expect(finalState.isLoading).toBe(false);
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
  });

  it('when a executeSearch rejected is received, set the error', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {type: 'search/executeSearch/rejected', payload: err};
    const finalState = searchReducer(state, action);
    expect(finalState.error).toEqual(err);
  });

  it('when a fetchMoreResults rejected is received, set the error', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {type: 'search/fetchMoreResults/rejected', payload: err};
    const finalState = searchReducer(state, action);
    expect(finalState.error).toEqual(err);
  });

  it('when a executeSearch fulfilled is received, set the error to null', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

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
    expect(finalState.error).toBeNull();
  });

  describe('should dispatch a logQueryError action', () => {
    let e: MockEngine<SearchAppState>;
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
  });

  it('when a fetchMoreResults fulfilled is received, set the error to null', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const result = buildMockResult();
    const response = buildMockSearchResponse({results: [result]});
    const searchState = buildMockSearch({
      response,
      duration: 123,
      queryExecuted: 'foo',
    });

    const action = fetchMoreResults.fulfilled(searchState, '');
    const finalState = searchReducer(state, action);
    expect(finalState.error).toBeNull();
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

  describe('when did you mean is enabled and a search is executed', () => {
    let e: MockEngine<SearchAppState>;

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
        const mockLogSubmit = makeAnalyticsAction(
          'analytics/test',
          AnalyticsType.Search,
          (_, state) => analyticsStateQuerySpy(state.query?.q)
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
});
