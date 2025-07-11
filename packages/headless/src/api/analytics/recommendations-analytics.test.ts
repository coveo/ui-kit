import {createMockRecommendationState} from '../../test/mock-recommendation-state.js';
import {buildMockResult} from '../../test/mock-result.js';
import {
  RecommendationAnalyticsProvider,
  type StateNeededByRecommendationAnalyticsProvider,
} from './recommendations-analytics.js';

describe('recommendations analytics', () => {
  const getBaseState = (): StateNeededByRecommendationAnalyticsProvider =>
    createMockRecommendationState();

  it('should properly return the pipeline from the state', () => {
    const state = getBaseState();
    state.pipeline = 'foo';
    expect(new RecommendationAnalyticsProvider(() => state).getPipeline()).toBe(
      'foo'
    );
  });

  it('should properly return getSearchEventRequestPayload', () => {
    const state = getBaseState();
    state.recommendation!.recommendations = [
      buildMockResult(),
      buildMockResult(),
    ];
    expect(
      new RecommendationAnalyticsProvider(
        () => state
      ).getSearchEventRequestPayload()
    ).toMatchObject({
      queryText: '',
      responseTime: 0,
      results: expect.any(Array),
      numberOfResults: 2,
    });
  });

  it('should properly return getSearchUID from recommendation.searchUid', () => {
    const state = getBaseState();
    state.recommendation!.searchUid = 'the_id';
    expect(
      new RecommendationAnalyticsProvider(() => state).getSearchUID()
    ).toEqual('the_id');
  });

  it('should return an undefined getSplitTestRunVersion if there is no splitTestRunName', () => {
    const state = getBaseState();
    state.recommendation!.splitTestRun = '';
    expect(
      new RecommendationAnalyticsProvider(() => state).getSplitTestRunVersion()
    ).toBeUndefined();
  });

  it('should return getSplitTestRunVersion from the pipeline search response if available', () => {
    const state = getBaseState();
    state.recommendation!.splitTestRun = 'foo';
    state.recommendation!.pipeline = 'pipeline-from-response';
    state.pipeline = 'pipeline-from-state';
    expect(
      new RecommendationAnalyticsProvider(() => state).getSplitTestRunVersion()
    ).toBe('pipeline-from-response');
  });

  it('should return getSplitTestRunVersion from the pipeline state value if there is no pipeline available in the search response', () => {
    const state = getBaseState();
    state.recommendation!.splitTestRun = 'foo';
    state.recommendation!.pipeline = '';
    state.pipeline = 'pipeline-from-state';
    expect(
      new RecommendationAnalyticsProvider(() => state).getSplitTestRunVersion()
    ).toBe('pipeline-from-state');
  });
});
