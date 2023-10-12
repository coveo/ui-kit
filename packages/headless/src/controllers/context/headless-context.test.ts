import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine.js';
import {buildContext, Context} from './headless-context.js';

describe('Context', () => {
  let context: Context;
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    context = buildContext(engine);
  });

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });
});
