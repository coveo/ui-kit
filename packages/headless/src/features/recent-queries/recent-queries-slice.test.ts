import type {Result} from '../../api/search/search/result.js';
import {buildMockSearch} from '../../test/mock-search.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {logSearchEvent} from '../analytics/analytics-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from './recent-queries-actions.js';
import {recentQueriesReducer} from './recent-queries-slice.js';
import {
  getRecentQueriesInitialState,
  type RecentQueriesState,
} from './recent-queries-state.js';

function withResult(rest = {}) {
  return {
    results: [{title: 'result'} as Result],
    ...rest,
  };
}

describe('recent-queries-slice', () => {
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

  it('#registerRecentQueries should trim and lowercase queries, and eliminate duplicates in state', () => {
    state = recentQueriesReducer(
      state,
      registerRecentQueries({
        queries: [
          'what is LOVE',
          'Oh baby',
          "don't hurt me",
          "   DON'T HURT ME   ",
          'no more!',
        ],
        maxLength: testMaxLength,
      })
    );

    expect(state.queries).toEqual([
      'what is love',
      'oh baby',
      "don't hurt me",
      'no more!',
    ]);
  });

  it('#registerRecentQueries should set maxLength in state', () => {
    state = recentQueriesReducer(
      state,
      registerRecentQueries({queries: testQueries, maxLength: testMaxLength})
    );

    expect(state.maxLength).toEqual(testMaxLength);
  });

  it('#registerRecentQueries should only keep queries up to the specified maxLength (after eliminating duplicates) in state', () => {
    const queries = [
      'what is LOVE',
      'Oh baby',
      "don't hurt me",
      "   DON'T HURT ME   ",
      'no more!',
    ];
    state = recentQueriesReducer(
      state,
      registerRecentQueries({queries: queries, maxLength: 3})
    );

    expect(state.queries).toEqual(['what is love', 'oh baby', "don't hurt me"]);
  });

  it('#clearRecentQueries should remove all queries from the queue in state', () => {
    state.queries = testQueries;

    state = recentQueriesReducer(state, clearRecentQueries());

    expect(state.queries).toEqual([]);
  });

  it('should add trimmed and lowercased new recent query on search fulfilled if queue is empty', () => {
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: testQuery,
        response: buildMockSearchResponse(
          withResult({
            queryCorrections: [{correctedQuery: 'FOO', wordCorrections: []}],
          })
        ),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual(
      testQueries
    );
  });

  it('should add trimmed and lowercased new recent query on search fulfilled if queue is non-empty', () => {
    const otherTestQuery = ' BAR ';
    state.queries = testQueries;
    state.maxLength = 10;
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: otherTestQuery,
        response: buildMockSearchResponse(
          withResult({
            queryCorrections: [{correctedQuery: ' BAR ', wordCorrections: []}],
          })
        ),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([
      'bar',
      ...testQueries,
    ]);
  });

  it('should add new recent query on search fulfilled and kick out oldest query if queue is full', () => {
    state.queries = ['five', 'four', 'three', 'two', 'one'];
    state.maxLength = 5;
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: ' SiX ',
        response: buildMockSearchResponse(withResult()),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([
      'six',
      'five',
      'four',
      'three',
      'two',
    ]);
  });

  it('should not add new recent query on search fulfilled if first query in queue is already the query', () => {
    const duplicates = [
      testQuery,
      ` ${testQuery}      `,
      `${testQuery.toUpperCase()}`,
    ];
    for (const i in duplicates) {
      state.queries = testQueries;
      state.maxLength = 10;
      const searchAction = executeSearch.fulfilled(
        buildMockSearch({
          queryExecuted: duplicates[i],
          response: buildMockSearchResponse(withResult()),
        }),
        '',
        {legacy: logSearchEvent({evt: 'foo'})}
      );

      expect(recentQueriesReducer(state, searchAction).queries).toEqual(
        testQueries
      );
    }
  });

  it('should not add new recent query on search fulfilled if there are no results', () => {
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        /* cspell:disable-next-line */
        queryExecuted: 'bloobloo',
        response: buildMockSearchResponse({}),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([]);
  });

  it('should not add an empty query to the list', () => {
    const emptyQueries = ['', '     '];
    for (const i in emptyQueries) {
      const searchAction = executeSearch.fulfilled(
        buildMockSearch({
          queryExecuted: emptyQueries[i],
          response: buildMockSearchResponse(withResult()),
        }),
        '',
        {legacy: logSearchEvent({evt: 'foo'})}
      );

      expect(recentQueriesReducer(state, searchAction).queries.length).toEqual(
        0
      );
    }
  });

  it('should place the query at the start of the list if it already exists', () => {
    state.queries = ['five', 'four', 'three', 'two', 'one'];
    state.maxLength = 5;
    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        queryExecuted: 'THREE',
        response: buildMockSearchResponse(withResult()),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([
      'three',
      'five',
      'four',
      'two',
      'one',
    ]);
  });
});
