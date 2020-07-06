import {
  searchReducer,
  getSearchInitialState,
  SearchState,
} from './search-slice';
import {executeSearch} from './search-actions';

import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearch} from '../../test/mock-search';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {buildMockEngine, MockEngine} from '../../test/mock-engine';
import {PlatformClient} from '../../api/platform-client';
import {createMockState} from '../../test/mock-state';
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
  });

  describe('when did you mean is enabled and a search is executed', () => {
    let e: MockEngine;
    beforeEach(() => {
      const state = createMockState();
      state.didYouMean.enableDidYouMean = true;
      e = buildMockEngine({state});
    });

    it('should retry the query automatically when corrections are available and there is no result', async () => {
      PlatformClient.call = jest.fn().mockImplementation(() =>
        Promise.resolve(
          buildMockSearchResponse({
            results: [],
            queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
          })
        )
      );
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).toContainEqual({
        type: 'didYouMean/correction',
        payload: 'foo',
      });
    });

    it('should not retry the query automatically when corrections are available and results are available', async () => {
      PlatformClient.call = jest.fn().mockImplementation(() =>
        Promise.resolve(
          buildMockSearchResponse({
            results: [buildMockResult()],
            queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
          })
        )
      );
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).not.toContainEqual({
        type: 'didYouMean/correction',
        payload: 'foo',
      });
    });

    it('should not retry the query automatically when no corrections are available and no results are available', async () => {
      PlatformClient.call = jest.fn().mockImplementation(() =>
        Promise.resolve(
          buildMockSearchResponse({
            results: [],
            queryCorrections: [],
          })
        )
      );
      await e.dispatch(executeSearch(logSearchboxSubmit()));
      expect(e.actions).not.toContainEqual({
        type: 'didYouMean/correction',
      });
    });
  });
});
