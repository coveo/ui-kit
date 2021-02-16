import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {buildSearchStatus} from './headless-search-status';
import {buildMockResult} from '../../test';

describe('SearchStatus', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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

  it('returns right state "hasResults"', () => {
    expect(buildSearchStatus(engine).state.firstSearchExecuted).toBe(false);

    engine.state.search.response.searchUid = '1234567';
    expect(buildSearchStatus(engine).state.firstSearchExecuted).toBe(true);
  });
});
