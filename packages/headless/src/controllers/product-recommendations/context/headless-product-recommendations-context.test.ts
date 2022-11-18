import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../../test/mock-engine';
import {
  buildContext,
  Context,
} from './headless-product-recommendations-context';

describe('Context', () => {
  let context: Context;
  let engine: MockProductRecommendationEngine;

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    context = buildContext(engine);
  });

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });
});
