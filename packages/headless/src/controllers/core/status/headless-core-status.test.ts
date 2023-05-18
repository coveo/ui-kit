import {searchReducer as search} from '../../../features/search/search-slice';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test/mock-engine';
import {buildMockResult} from '../../../test/mock-result';
import {buildCoreStatus} from './headless-core-status';

describe('CoreStatus', () => {
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('it adds the correct reducers to engine', () => {
    buildCoreStatus(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({search});
  });

  it('returns right state "isLoading"', () => {
    expect(buildCoreStatus(engine).state.isLoading).toBe(false);

    engine.state.search.isLoading = true;
    expect(buildCoreStatus(engine).state.isLoading).toBe(true);
  });

  it('returns right state "hasResults"', () => {
    expect(buildCoreStatus(engine).state.hasResults).toBe(false);

    engine.state.search.results = [buildMockResult()];
    expect(buildCoreStatus(engine).state.hasResults).toBe(true);
  });

  it('returns right state "firstSearchExecuted"', () => {
    expect(buildCoreStatus(engine).state.firstSearchExecuted).toBe(false);

    engine.state.search.response.searchUid = '1234567';
    expect(buildCoreStatus(engine).state.firstSearchExecuted).toBe(true);
  });

  it('returns right state "hasError"', () => {
    expect(buildCoreStatus(engine).state.hasError).toBe(false);

    engine.state.search.error = {
      message: 'unknown',
      statusCode: 0,
      type: 'unknown',
    };
    expect(buildCoreStatus(engine).state.hasError).toBe(true);
  });
});
