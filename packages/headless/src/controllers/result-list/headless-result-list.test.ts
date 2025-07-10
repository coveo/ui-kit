import {fetchMoreResults} from '../../features/search/search-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockResult} from '../../test/mock-result.js';
import {createMockState} from '../../test/mock-state.js';
import {buildResultList} from './headless-result-list.js';

vi.mock('../../features/search/search-actions');

describe('ResultList', () => {
  let engine: MockedSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    const results = new Array(10).fill(buildMockResult());
    engine.state.search.results = results;
    engine.state.search.response.totalCountFiltered = 1000;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetchMoreResults should dispatch a fetchMoreResults action', () => {
    buildResultList(engine).fetchMoreResults();
    expect(fetchMoreResults).toHaveBeenCalled();
  });
});
