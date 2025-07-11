import {buildMockResult} from '../../test/mock-result.js';
import {
  clearRecentResults,
  pushRecentResult,
  registerRecentResults,
} from './recent-results-actions.js';
import {recentResultsReducer} from './recent-results-slice.js';
import {
  getRecentResultsInitialState,
  type RecentResultsState,
} from './recent-results-state.js';

describe('recent-results slice', () => {
  let state: RecentResultsState;

  const resultStringParams = {
    title: 'title',
    uri: 'uri',
    printableUri: 'printable-uri',
    clickUri: 'click-uri',
    uniqueId: 'unique-id',
    excerpt: 'excerpt',
    firstSentences: 'first-sentences',
    flags: 'flags',
  };

  const mockResult = buildMockResult(resultStringParams);
  const otherMockResult = buildMockResult({
    ...resultStringParams,
    uniqueId: 'different-id-1',
  });
  const mockResults = [mockResult];
  const testMaxLength = 5;

  beforeEach(() => {
    state = getRecentResultsInitialState();
  });

  it('should have initial state', () => {
    expect(recentResultsReducer(undefined, {type: 'foo'})).toEqual({
      maxLength: 10,
      results: [],
    });
  });

  it('#registerRecentResults should set results and maxLength params in state', () => {
    state = recentResultsReducer(
      state,
      registerRecentResults({results: mockResults, maxLength: testMaxLength})
    );

    expect(state.results).toEqual(mockResults);
    expect(state.maxLength).toEqual(testMaxLength);
  });

  it('#registerRecentResults should shorten result list if it exceeds maxLength param', () => {
    const results = [mockResult, otherMockResult];
    state = recentResultsReducer(
      state,
      registerRecentResults({results: results, maxLength: 1})
    );

    expect(state.results).toEqual([mockResult]);
  });

  it('#clearRecentResults should remove all results from the queue in state', () => {
    state.results = mockResults;

    state = recentResultsReducer(state, clearRecentResults());

    expect(state.results).toEqual([]);
  });

  it('#pushRecentResult should add new recent result if queue is empty', () => {
    state = recentResultsReducer(state, pushRecentResult(mockResult));

    expect(state.results).toEqual([mockResult]);
  });

  it('#pushRecentResult should add new recent result if queue is non-empty', () => {
    state.results = [otherMockResult];
    state = recentResultsReducer(state, pushRecentResult(mockResult));

    expect(state.results).toEqual([mockResult, otherMockResult]);
  });

  it('#pushRecentResult should add new recent result and kick out oldest result if queue is full', () => {
    state.results = [
      otherMockResult,
      buildMockResult({...resultStringParams, uniqueId: 'different-id-2'}),
    ];
    state.maxLength = 2;
    state = recentResultsReducer(state, pushRecentResult(mockResult));

    expect(state.results).toEqual([mockResult, otherMockResult]);
  });

  it('#pushRecentResult should place the result at the beginning of the array if it is already present', () => {
    state.results = [mockResult, otherMockResult];
    state.maxLength = 2;
    state = recentResultsReducer(state, pushRecentResult(otherMockResult));

    expect(state.results).toEqual([otherMockResult, mockResult]);
  });
});
