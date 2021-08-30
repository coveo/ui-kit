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
  const testMaxLength = 5;

  beforeEach(() => {
    state = getRecentQueriesInitialState();
  });

  it('should have initial state', () => {
    expect(recentQueriesReducer(undefined, {type: 'foo'})).toEqual({
      maxLength: 10,
      queries: [],
    });
  });

  it('#registerRecentQueries should set queries and maxLength params in state', () => {
    state = recentQueriesReducer(
      state,
      registerRecentQueries({queries: testQueries, maxLength: testMaxLength})
    );

    expect(state.queries).toEqual(testQueries);
    expect(state.maxLength).toEqual(testMaxLength);
  });

  it('#registerRecentQueries should shorten queries if it exceeds maxLength param', () => {
    const queries = ['q1', 'q2', 'q3', 'q4'];
    state = recentQueriesReducer(
      state,
      registerRecentQueries({queries: queries, maxLength: 3})
    );

    expect(state.queries).toEqual(['q1', 'q2', 'q3']);
  });

  it('#clearRecentQueries should remove all queries from the queue in state', () => {
    state.queries = testQueries;

    state = recentQueriesReducer(state, clearRecentQueries());

    expect(state.queries).toEqual([]);
  });

  it('should add new recent query on search fulfilled if queue is empty', () => {
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

  it('should add new recent query on search fulfilled if queue is non-empty', () => {
    const otherTestQuery = 'bar';
    state.queries = testQueries;
    state.maxLength = 10;
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

  it('should add new recent query on search fulfilled and kick out oldest query if queue is full', () => {
    state.queries = ['5', '4', '3', '2', '1'];
    state.maxLength = 5;
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: '6',
        response: buildMockSearchResponse({}),
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

  it('should not add new recent query on search fulfilled if queue already contains the query', () => {
    const otherTestQuery = 'what is a query';
    state.queries = testQueries;
    state.maxLength = 10;
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: otherTestQuery,
        response: buildMockSearchResponse({}),
      }),
      '',
      logSearchEvent({evt: 'foo'})
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual(
      testQueries
    );
  });
});
