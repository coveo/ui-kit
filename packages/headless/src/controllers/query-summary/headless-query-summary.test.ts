import {createMockState} from '../../test/mock-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {QuerySummary, buildQuerySummary} from './headless-query-summary';
import {buildMockResult} from '../../test/mock-result';
import {SearchAppState} from '../../state/search-app-state';
import {pagination, search} from '../../app/reducers';

describe('headless query summary', () => {
  let engine: MockEngine<SearchAppState>;
  let state: SearchAppState;
  let querySummary: QuerySummary;

  beforeEach(() => {
    state = createMockState();
    engine = buildMockSearchAppEngine({state});
    querySummary = buildQuerySummary(engine);
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
    expect(querySummary.state.query).toBe('bar');
  });

  it('should return #firstResult', () => {
    state.pagination.firstResult = 0;
    expect(querySummary.state.firstResult).toBe(1);
    state.pagination.firstResult = 1;
    expect(querySummary.state.firstResult).toBe(2);
  });

  it('should return #lastResult', () => {
    state.pagination.firstResult = 1;
    state.pagination.numberOfResults = 999;
    state.search.results = [buildMockResult(), buildMockResult()];
    expect(querySummary.state.lastResult).toBe(3);
  });

  it('should return #total', () => {
    state.pagination.totalCountFiltered = 1234;
    expect(querySummary.state.total).toBe(1234);
  });

  it('should return hasQuery', () => {
    state.search.queryExecuted = '';
    expect(querySummary.state.hasQuery).toBe(false);
    state.search.queryExecuted = 'foo';
    expect(querySummary.state.hasQuery).toBe(true);
  });

  it('should return #hasDuration', () => {
    state.search.duration = 0;
    expect(querySummary.state.hasDuration).toBe(false);
    state.search.duration = 1;
    expect(querySummary.state.hasDuration).toBe(true);
  });

  it('should return #hasResults', () => {
    state.search.results = [buildMockResult()];
    expect(querySummary.state.hasResults).toBe(true);
    state.search.results = [];
    expect(querySummary.state.hasResults).toBe(false);
  });

  it('should return #durationInMilliseconds', () => {
    state.search.duration = 123;
    expect(querySummary.state.durationInMilliseconds).toBe(123);
  });

  it('should return #durationInSeconds', () => {
    state.search.duration = 123;
    expect(querySummary.state.durationInSeconds).toBe(0.12);
  });

  it('should return #durationInSeconds rounded off', () => {
    state.search.duration = 123.7777777777777;
    expect(querySummary.state.durationInSeconds).toBe(0.12);
  });
});
