import {buildContext, Context} from './headless-product-listing-context';
import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test/mock-engine';

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
