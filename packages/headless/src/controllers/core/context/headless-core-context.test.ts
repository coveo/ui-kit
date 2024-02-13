import {
  addContext,
  removeContext,
  setContext,
} from '../../../features/context/context-actions';
import {contextReducer} from '../../../features/context/context-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {buildCoreContext, Context} from './headless-core-context';

jest.mock('../../../features/context/context-actions');

describe('Context', () => {
  let context: Context;
  let engine: MockedSearchEngine;

  beforeEach(() => {
    jest.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
    context = buildCoreContext(engine);
  });

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
    expect(setContext).toHaveBeenCalledWith(
      expect.objectContaining({foo: ['bar']})
    );
  });

  it('initialize context with values dispatches #setContext', () => {
    buildCoreContext(engine, {
      initialState: {values: {foo: ['bar']}},
    });
    expect(setContext).toHaveBeenCalledWith(
      expect.objectContaining({foo: ['bar']})
    );
  });

  it('addContext dispatches #addContext', () => {
    context.add('foo', ['bar']);
    expect(addContext).toHaveBeenCalledWith(
      expect.objectContaining({contextKey: 'foo', contextValue: ['bar']})
    );
  });

  it('removeContext dispatches #removeContext', () => {
    context.remove('foo');
    expect(removeContext).toHaveBeenCalledWith('foo');
  });
});
