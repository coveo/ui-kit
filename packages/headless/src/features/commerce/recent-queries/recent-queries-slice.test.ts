import {buildSearchResponse} from '../../../test/mock-commerce-search.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {
  getRecentQueriesInitialState,
  type RecentQueriesState,
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

  it('#registerRecentQueries should set maxLength params in state', () => {
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
    const otherTestQuery = ' BAR ';
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
      'bar',
      ...testQueries,
    ]);
  });

  it('should add new recent query on search fulfilled and kick out oldest query if queue is full', () => {
    state.queries = ['five', 'four', 'three', 'two', 'one'];
    state.maxLength = 5;
    const searchAction = executeSearch.fulfilled(
      buildSearchResponse({products: [buildMockProduct()]}, 'SiX', 'SiX'),
      ''
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
    state.queries = ['five', 'four', 'three', 'two', 'one'];
    state.maxLength = 5;
    const searchAction = executeSearch.fulfilled(
      buildSearchResponse(
        {
          products: [buildMockProduct()],
        },
        'THREE',
        'THREE'
      ),
      ''
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
