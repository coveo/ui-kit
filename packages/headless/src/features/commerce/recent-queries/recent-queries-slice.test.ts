import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {
  RecentQueriesState,
  getRecentQueriesInitialState,
} from '../../recent-queries/recent-queries-state.js';
import {executeSearch} from '../search/search-actions.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from './recent-queries-actions.js';
import {recentQueriesReducer} from './recent-queries-slice.js';

describe('commerce/recent-queries-slice', () => {
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
      buildSearchResponse(
        {products: [buildMockProduct()]},
        testQuery,
        testQuery
      ),
      ''
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
      buildSearchResponse(
        {products: [buildMockProduct()]},
        otherTestQuery,
        otherTestQuery
      ),
      ''
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
      buildSearchResponse({products: [buildMockProduct()]}, '6', '6'),
      ''
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
    const duplicates = [testQuery, ` ${testQuery}      `];
    for (const i in duplicates) {
      state.queries = testQueries;
      state.maxLength = 10;
      const searchAction = executeSearch.fulfilled(
        buildSearchResponse(
          {products: [buildMockProduct()]},
          duplicates[i],
          duplicates[i]
        ),
        ''
      );

      expect(recentQueriesReducer(state, searchAction).queries).toEqual(
        testQueries
      );
    }
  });

  it('should not add new recent query on search fulfilled if there are no results', () => {
    const searchAction = executeSearch.fulfilled(
      buildSearchResponse({products: []}, 'hello world', 'hello world'),
      ''
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([]);
  });

  it('should not add an empty query to the list', () => {
    const emptyQueries = ['', '     '];
    for (const i in emptyQueries) {
      const searchAction = executeSearch.fulfilled(
        buildSearchResponse(
          {products: [buildMockProduct()]},
          emptyQueries[i],
          emptyQueries[i]
        ),
        ''
      );

      expect(recentQueriesReducer(state, searchAction).queries.length).toEqual(
        0
      );
    }
  });

  it('should place the query at the start of the list if it already exists', () => {
    state.queries = ['5', '4', '3', '2', '1'];
    state.maxLength = 5;
    const searchAction = executeSearch.fulfilled(
      buildSearchResponse(
        {
          products: [buildMockProduct()],
        },
        '3',
        '3'
      ),
      ''
    );

    expect(recentQueriesReducer(state, searchAction).queries).toEqual([
      '3',
      '5',
      '4',
      '2',
      '1',
    ]);
  });
});
