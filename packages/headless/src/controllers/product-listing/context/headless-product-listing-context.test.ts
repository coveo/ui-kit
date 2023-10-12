import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test/mock-engine.js';
import {buildContext, Context} from './headless-product-listing-context.js';

describe('Context', () => {
  let context: Context;
  let engine: MockProductListingEngine;

  beforeEach(() => {
    engine = buildMockProductListingEngine();
    context = buildContext(engine);
  });

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });
});
