import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildSearchStatus} from './headless-search-status';
import {buildMockResult} from '../../test';
import {search} from '../../app/reducers';

describe('SearchStatus', () => {
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('it adds the correct reducers to engine', () => {
    buildSearchStatus(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({search});
  });

  it('returns right state "isLoading"', () => {
    expect(buildSearchStatus(engine).state.isLoading).toBe(false);

    engine.state.search.isLoading = true;
    expect(buildSearchStatus(engine).state.isLoading).toBe(true);
  });

  it('returns right state "hasResults"', () => {
    expect(buildSearchStatus(engine).state.hasResults).toBe(false);

    engine.state.search.results = [buildMockResult()];
    expect(buildSearchStatus(engine).state.hasResults).toBe(true);
  });

  it('returns right state "firstSearchExecuted"', () => {
    expect(buildSearchStatus(engine).state.firstSearchExecuted).toBe(false);

    engine.state.search.response.searchUid = '1234567';
    expect(buildSearchStatus(engine).state.firstSearchExecuted).toBe(true);
  });

  it('returns right state "hasError"', () => {
    expect(buildSearchStatus(engine).state.hasError).toBe(false);

    engine.state.search.error = {
      message: 'unknown',
      statusCode: 0,
      type: 'unknown',
    };
    expect(buildSearchStatus(engine).state.hasError).toBe(true);
  });
});
