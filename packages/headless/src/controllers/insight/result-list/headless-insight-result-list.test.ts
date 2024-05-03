import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {buildMockResult} from '../../../test/mock-result';
import {buildResultList} from './headless-insight-result-list';

jest.mock('../../../features/insight-search/insight-search-actions');

describe('InsightResultList', () => {
  let engine: MockedInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
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
    expect(fetchMoreResults).toHaveBeenCalled();
  });
});
