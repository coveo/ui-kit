import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {logSearchEvent} from '../analytics/analytics-actions';
import {executeSearch} from '../search/search-actions';
import {
  clearRecentQueries,
  registerRecentQueries,
} from './recent-queries-actions';
import {recentQueriesReducer} from './recent-queries-slice';
import {
  getRecentQueriesInitialState,
  RecentQueriesState,
} from './recent-queries-state';

describe('recent-queries slice', () => {
  let state: RecentQueriesState;

  const testQuery = 'what is a query';
  const testQueries = [testQuery];
  const testMaxQueries = 5;

  beforeEach(() => {
    state = getRecentQueriesInitialState();
  });

  it('should have initial state', () => {
    expect(recentQueriesReducer(undefined, {type: 'foo'})).toEqual({
      maxQueries: 10,
      queries: [],
    });
  });

  it('#registerRecentQueries should set queries and maxQueries params in state', () => {
    state = recentQueriesReducer(
      state,
      registerRecentQueries({queries: testQueries, maxQueries: testMaxQueries})
    );

    expect(state.queries).toEqual(testQueries);
    expect(state.maxQueries).toEqual(testMaxQueries);
  });

  it('#clearRecentQueries should remove all queries from the queue in state', () => {
    state.queries = testQueries;

    state = recentQueriesReducer(state, clearRecentQueries());

    expect(state.queries).toEqual([]);
  });

  it('should set new recent query on search fulfilled if queue is empty', () => {
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: testQuery,
        response: buildMockSearchResponse({
          queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
        }),
      }),
      '',
      logSearchEvent({evt: 'foo'})
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual(
      testQueries
    );
  });

  it('should set new recent query on search fulfilled if queue is empty', () => {
    const otherTestQuery = 'bar';
    state.queries = testQueries;
    state.maxQueries = 10;
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: otherTestQuery,
        response: buildMockSearchResponse({
          queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
        }),
      }),
      '',
      logSearchEvent({evt: 'foo'})
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([
      otherTestQuery,
      ...testQueries,
    ]);
  });

  it('should set new recent query on search fulfilled and kick out oldest query if queue is full', () => {
    state.queries = ['5', '4', '3', '2', '1'];
    state.maxQueries = 5;
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: '6',
        response: buildMockSearchResponse({
          queryCorrections: [{correctedQuery: 'foo', wordCorrections: []}],
        }),
      }),
      '',
      logSearchEvent({evt: 'foo'})
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([
      '6',
      '5',
      '4',
      '3',
      '2',
    ]);
  });
});
