import {search} from '../../../app/reducers';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test/mock-engine';
import {buildMockResult} from '../../../test/mock-result';
import {buildCoreSearchStatus} from './headless-core-status';

describe('CoreStatus', () => {
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('it adds the correct reducers to engine', () => {
    buildCoreSearchStatus(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({search});
  });

  it('returns right state "isLoading"', () => {
    expect(buildCoreSearchStatus(engine).state.isLoading).toBe(false);

    engine.state.search.isLoading = true;
    expect(buildCoreSearchStatus(engine).state.isLoading).toBe(true);
  });

  it('returns right state "hasResults"', () => {
    expect(buildCoreSearchStatus(engine).state.hasResults).toBe(false);

    engine.state.search.results = [buildMockResult()];
    expect(buildCoreSearchStatus(engine).state.hasResults).toBe(true);
  });

  it('returns right state "firstSearchExecuted"', () => {
    expect(buildCoreSearchStatus(engine).state.firstSearchExecuted).toBe(false);

    engine.state.search.response.searchUid = '1234567';
    expect(buildCoreSearchStatus(engine).state.firstSearchExecuted).toBe(true);
  });

  it('returns right state "hasError"', () => {
    expect(buildCoreSearchStatus(engine).state.hasError).toBe(false);

    engine.state.search.error = {
      message: 'unknown',
      statusCode: 0,
      type: 'unknown',
    };
    expect(buildCoreSearchStatus(engine).state.hasError).toBe(true);
  });
});
