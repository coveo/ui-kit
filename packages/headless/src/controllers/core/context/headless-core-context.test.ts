import {Action} from '@reduxjs/toolkit';
import {
  setContext,
  addContext,
  removeContext,
} from '../../../features/context/context-actions';
import {contextReducer} from '../../../features/context/context-slice';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test/mock-engine';
import {buildCoreContext, Context} from './headless-core-context';

describe('Context', () => {
  let context: Context;
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    context = buildCoreContext(engine);
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('initializes properly', () => {
    expect(context.state.values).toEqual({});
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      context: contextReducer,
    });
  });

  it('setContext dispatches #setContext', () => {
    context.set({foo: ['bar']});
    expectContainAction(setContext);
  });

  it('initialize context with values dispatches #setContext', () => {
    buildCoreContext(engine, {
      initialState: {values: {foo: ['bar']}},
    });
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
