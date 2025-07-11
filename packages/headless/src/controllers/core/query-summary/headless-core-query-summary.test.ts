import {paginationReducer as pagination} from '../../../features/pagination/pagination-slice.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {SearchAppState} from '../../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreQuerySummary,
  type QuerySummary,
} from './headless-core-query-summary.js';

describe('CoreQuerySummary', () => {
  let engine: MockedSearchEngine;
  let state: SearchAppState;
  let coreQuerySummary: QuerySummary;

  beforeEach(() => {
    state = createMockState();
    engine = buildMockSearchEngine(state);
    coreQuerySummary = buildCoreQuerySummary(engine);
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      search,
      pagination,
    });
  });

  it('should return the executed query and not the query being executed', () => {
    state.query.q = 'foo';
    state.search.queryExecuted = 'bar';
    expect(coreQuerySummary.state.query).toBe('bar');
  });

  it('should return #firstResult', () => {
    state.pagination.firstResult = 0;
    expect(coreQuerySummary.state.firstResult).toBe(1);
    state.pagination.firstResult = 1;
    expect(coreQuerySummary.state.firstResult).toBe(2);
  });

  it('should return #lastResult', () => {
    state.pagination.firstResult = 1;
    state.pagination.numberOfResults = 999;
    state.search.results = [buildMockResult(), buildMockResult()];
    expect(coreQuerySummary.state.lastResult).toBe(3);
  });

  it('should return #total', () => {
    state.pagination.totalCountFiltered = 1234;
    expect(coreQuerySummary.state.total).toBe(1234);
  });

  it('should return #hasQuery', () => {
    state.search.queryExecuted = '';
    expect(coreQuerySummary.state.hasQuery).toBe(false);
    state.search.queryExecuted = 'foo';
    expect(coreQuerySummary.state.hasQuery).toBe(true);
  });

  it('should return #hasDuration', () => {
    state.search.duration = 0;
    expect(coreQuerySummary.state.hasDuration).toBe(false);
    state.search.duration = 1;
    expect(coreQuerySummary.state.hasDuration).toBe(true);
  });

  it('should return #hasResults', () => {
    state.search.results = [buildMockResult()];
    expect(coreQuerySummary.state.hasResults).toBe(true);
    state.search.results = [];
    expect(coreQuerySummary.state.hasResults).toBe(false);
  });

  it('should return #durationInMilliseconds', () => {
    state.search.duration = 123;
    expect(coreQuerySummary.state.durationInMilliseconds).toBe(123);
  });

  it('should return #durationInSeconds', () => {
    state.search.duration = 123;
    expect(coreQuerySummary.state.durationInSeconds).toBe(0.12);
  });

  it('should return #durationInSeconds rounded off', () => {
    state.search.duration = 123.7777777777777;
    expect(coreQuerySummary.state.durationInSeconds).toBe(0.12);
  });
});
