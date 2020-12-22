import {contextReducer} from './context-slice';
import {setContext, addContext, removeContext} from './context-actions';
import {change} from '../history/history-actions';
import {ContextState, getContextInitialState} from './context-state';
import {getHistoryInitialState} from '../history/history-state';

describe('context slice', () => {
  let state: ContextState;

  beforeEach(() => {
    state = getContextInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = contextReducer(undefined, {type: ''});
    expect(finalState).toEqual({
      contextValues: {},
    });
  });

  it('allow to set a context', () => {
    const finalState = contextReducer(state, setContext({foo: 'bar'}));
    expect(finalState).toEqual({
      contextValues: {foo: 'bar'},
    });
  });

  it('allows to overwrite a context', () => {
    contextReducer(state, setContext({foo: 'bar'}));
    const secondState = contextReducer(state, setContext({hello: 'world'}));
    expect(secondState).toEqual({
      contextValues: {hello: 'world'},
    });
  });

  it('allows to add a context', () => {
    let modifiedState = contextReducer(
      state,
      addContext({contextKey: 'foo', contextValue: ['1', '2', '3']})
    );
    modifiedState = contextReducer(
      modifiedState,
      addContext({contextKey: 'hello', contextValue: 'world'})
    );
    expect(modifiedState).toEqual({
      contextValues: {foo: ['1', '2', '3'], hello: 'world'},
    });
  });

  it('allows to remove a context', () => {
    state.contextValues = {foo: 'bar', hello: 'world'};
    let modifiedState = contextReducer(state, removeContext('doesNotExists'));
    modifiedState = contextReducer(modifiedState, removeContext('foo'));
    expect(modifiedState).toEqual({
      contextValues: {hello: 'world'},
    });
  });

  it('allows to restore a context on history change', () => {
    const state = getContextInitialState();
    const historyChange = {
      ...getHistoryInitialState(),
      context: {contextValues: {foo: 'bar'}},
    };

    const nextState = contextReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState.contextValues).toEqual({
      foo: 'bar',
    });
  });
});
