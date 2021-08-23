import {buildMockResult} from '../../test';
import {
  clearRecentResults,
  pushRecentResult,
  registerRecentResults,
} from './recent-results-actions';
import {recentResultsReducer} from './recent-results-slice';
import {
  getRecentResultsInitialState,
  RecentResultsState,
} from './recent-results-state';

describe('recent-results slice', () => {
  let state: RecentResultsState;

  const mockResult = buildMockResult();
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
    state.results = [buildMockResult({uniqueId: 'different-id-1'})];
    state = recentResultsReducer(state, pushRecentResult(mockResult));

    expect(state.results.length).toBe(2);
  });

  it('#pushRecentResult should add new recent result and kick out oldest result if queue is full', () => {
    const mockResult1 = buildMockResult({uniqueId: 'different-id-1'});
    state.results = [
      mockResult1,
      buildMockResult({uniqueId: 'different-id-2'}),
    ];
    state.maxLength = 2;
    state = recentResultsReducer(state, pushRecentResult(mockResult));

    expect(state.results).toEqual([mockResult, mockResult1]);
  });

  it('#pushRecentResult should not add new recent query on search fulfilled if queue already contains the query', () => {
    const mockResult1 = buildMockResult({uniqueId: 'different-id-1'});
    state.results = [mockResult, mockResult1];
    state.maxLength = 2;
    state = recentResultsReducer(state, pushRecentResult(mockResult1));

    expect(state.results).toEqual([mockResult, mockResult1]);
  });
});
