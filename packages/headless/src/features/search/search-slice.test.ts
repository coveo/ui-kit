import {searchReducer} from './search-slice';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearch} from '../../test/mock-search';
import {executeSearch} from './search-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {PlatformClient} from '../../api/platform-client';
import {createMockState} from '../../test/mock-state';
import {getSearchInitialState, SearchState} from './search-state';
import {SearchAppState} from '../../state/search-app-state';
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

  it('set the error on rejection', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    const action = executeSearch.rejected(
      {message: 'asd', name: 'asd'},
      '',
      logSearchboxSubmit(),
      err
    );
    const finalState = searchReducer(state, action);
    expect(finalState.error).toEqual(err);
  });

  it('set the error to null on success', () => {
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

  it('set the isloading state to true during executeSearch.pending', () => {
    const pendingAction = executeSearch.pending('asd', logSearchboxSubmit());
    const finalState = searchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  describe('when did you mean is enabled and a search is executed', () => {
    let e: MockEngine<SearchAppState>;
    beforeEach(() => {
      const state = createMockState();
      state.didYouMean.enableDidYouMean = true;
      e = buildMockSearchAppEngine({state});
    });

    it('should retry the query automatically when corrections are available and there is no result', async () => {
      PlatformClient.call = jest.fn().mockImplementation(() =>
        Promise.resolve({
          body: buildMockSearchResponse({
            results: [],
            queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
          }),
        })
      );
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).toContainEqual({
        type: 'didYouMean/correction',
        payload: 'foo',
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
        type: 'didYouMean/correction',
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
        type: 'didYouMean/correction',
      });
    });
  });
});
