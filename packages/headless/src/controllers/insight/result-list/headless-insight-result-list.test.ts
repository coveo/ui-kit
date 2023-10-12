import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions.js';
import {buildMockResult} from '../../../test.js';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine.js';
import {buildResultList} from './headless-insight-result-list.js';

describe('InsightResultList', () => {
  let engine: MockInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine();
    const results = new Array(10).fill(buildMockResult());
    engine.state.search.results = results;
    engine.state.search.response.totalCountFiltered = 1000;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetchMoreResults should dispatch a fetchMoreResults action', () => {
    buildResultList(engine).fetchMoreResults();
    expect(
      engine.actions.find(
        (action) => action.type === fetchMoreResults.pending.type
      )
    ).toBeTruthy();
  });
});
