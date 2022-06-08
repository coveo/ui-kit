import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildInsightSearchStatus} from './headless-insight-search-status';
import {buildMockResult} from '../../../test';
import {search} from '../../../app/reducers';

describe('InsightSearchStatus', () => {
  let engine: MockInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine();
  });

  it('it adds the correct reducers to engine', () => {
    buildInsightSearchStatus(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({search});
  });

  it('returns right state "isLoading"', () => {
    expect(buildInsightSearchStatus(engine).state.isLoading).toBe(false);

    engine.state.search.isLoading = true;
    expect(buildInsightSearchStatus(engine).state.isLoading).toBe(true);
  });

  it('returns right state "hasResults"', () => {
    expect(buildInsightSearchStatus(engine).state.hasResults).toBe(false);

    engine.state.search.results = [buildMockResult()];
    expect(buildInsightSearchStatus(engine).state.hasResults).toBe(true);
  });

  it('returns right state "firstSearchExecuted"', () => {
    expect(buildInsightSearchStatus(engine).state.firstSearchExecuted).toBe(
      false
    );

    engine.state.search.response.searchUid = '1234567';
    expect(buildInsightSearchStatus(engine).state.firstSearchExecuted).toBe(
      true
    );
  });

  it('returns right state "hasError"', () => {
    expect(buildInsightSearchStatus(engine).state.hasError).toBe(false);

    engine.state.search.error = {
      message: 'unknown',
      statusCode: 0,
      type: 'unknown',
    };
    expect(buildInsightSearchStatus(engine).state.hasError).toBe(true);
  });
});
