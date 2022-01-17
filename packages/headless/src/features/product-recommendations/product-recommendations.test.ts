import {buildMockProductRecommendationsAppEngine} from '../../test/mock-engine';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {PlatformClient} from '../../api/platform-client';
import {Response} from 'cross-fetch';
import {getProductRecommendations} from './product-recommendations-actions';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';

describe('product-recommendations', () => {
  it('correctly parses a response with childResults', async () => {
    const state = buildMockProductRecommendationsState();
    const engine = buildMockProductRecommendationsAppEngine({state});

    PlatformClient.call = jest.fn().mockImplementation(() => {
      const body = JSON.stringify({
        results: [
          {
            raw: {},
            childResults: [
              {
                raw: {},
                childResults: [],
                totalNumberOfChildResults: 0,
              },
            ],
            totalNumberOfChildResults: 2,
          },
        ],
      });
      const response = new Response(body);

      return Promise.resolve(response);
    });

    const result = await engine.dispatch(getProductRecommendations());
    let recommendations: ProductRecommendation[] = [];

    if (result.payload && 'recommendations' in result.payload)
      recommendations = result.payload.recommendations;
    expect(recommendations).toHaveLength(1);

    if (recommendations.length > 0) {
      const recommendation = recommendations[0];
      expect(recommendation.childResults).toBeDefined;
      expect(recommendation.childResults).toHaveLength(1);
      expect(recommendation.totalNumberOfChildResults).toBe(2);

      if (
        recommendation.childResults &&
        recommendation.childResults.length > 0
      ) {
        const childRecommendation = recommendation.childResults[0];
        expect(childRecommendation.childResults).toHaveLength(0);
        expect(childRecommendation.totalNumberOfChildResults).toBe(0);
      }
    }
  });
});
