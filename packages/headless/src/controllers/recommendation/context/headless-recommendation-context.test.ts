import {
  buildMockRecommendationAppEngine,
  MockRecommendationEngine,
} from '../../../test/mock-engine.js';
import {buildContext, Context} from './headless-recommendation-context.js';

describe('Context', () => {
  let context: Context;
  let engine: MockRecommendationEngine;

  beforeEach(() => {
    engine = buildMockRecommendationAppEngine();
    context = buildContext(engine);
  });

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });
});
