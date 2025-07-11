import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {buildResultList} from './headless-insight-result-list.js';

vi.mock('../../../features/insight-search/insight-search-actions');

describe('InsightResultList', () => {
  let engine: MockedInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
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
