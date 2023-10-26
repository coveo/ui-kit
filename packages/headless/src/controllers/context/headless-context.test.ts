import {setContext} from '../../features/context/context-actions';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildContext, Context, ContextInitialState} from './headless-context';

describe('Context', () => {
  let context: Context;
  let engine: MockSearchEngine;
  let initialState: ContextInitialState | undefined;

  function initContext() {
    engine = buildMockSearchAppEngine();
    context = buildContext(engine, {initialState});
  }

  beforeEach(() => {
    initialState = undefined;
    initContext();
  });

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });

  it('when #initialState.values is defined, it sets the context', () => {
    initialState = {
      values: {foo: 'bar'},
    };
    initContext();
    expect(engine.actions).toContainEqual(setContext({foo: 'bar'}));
  });
});
