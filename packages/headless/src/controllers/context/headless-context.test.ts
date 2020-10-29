import {buildContext, Context} from './headless-context';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {Action} from 'redux';
import {
  setContext,
  addContext,
  removeContext,
} from '../../features/context/context-actions';
import {SearchAppState} from '../../state/search-app-state';

describe('Context', () => {
  let context: Context;
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
