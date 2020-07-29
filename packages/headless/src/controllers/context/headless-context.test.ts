import {buildContext, Context} from './headless-context';
import {buildMockEngine, MockEngine} from '../../test/mock-engine';
import {Action} from 'redux';
import {
  setContext,
  addContext,
  removeContext,
} from '../../features/context/context-action';

describe('Context', () => {
  let context: Context;
  let engine: MockEngine;

  beforeEach(() => {
    engine = buildMockEngine();
    context = buildContext(engine);
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });

  it('setContext dispatches #setContext', () => {
    context.set({foo: ['bar']});
    expectContainAction(setContext);
  });

  it('addContext dispatches #addContext', () => {
    context.add('foo', ['bar']);
    expectContainAction(addContext);
  });

  it('removeContext dispatches #removeContext', () => {
    context.remove('foo');
    expectContainAction(removeContext);
  });
});
