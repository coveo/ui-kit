import {buildMockResult} from '../../test';
import {createMockRecommendationState} from '../../test/mock-recommendation-state';
import {
  RecommendationAnalyticsProvider,
  StateNeededByRecommendationAnalyticsProvider,
} from './recommendations-analytics';

describe('recommendations analytics', () => {
  const getBaseState = (): StateNeededByRecommendationAnalyticsProvider =>
    createMockRecommendationState();

  it('should properly return the pipeline from the state', () => {
    const state = getBaseState();
    state.pipeline = 'foo';
    expect(new RecommendationAnalyticsProvider(state).getPipeline()).toBe(
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
      new RecommendationAnalyticsProvider(state).getSearchEventRequestPayload()
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
    expect(new RecommendationAnalyticsProvider(state).getSearchUID()).toEqual(
      'the_id'
    );
  });
});
