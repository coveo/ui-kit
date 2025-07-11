import {beforeEach, describe, expect, it, vi} from 'vitest';
import {setContext} from '../../features/context/context-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildContext,
  type Context,
  type ContextInitialState,
} from './headless-context.js';

vi.mock('../../features/context/context-actions');

describe('Context', () => {
  let context: Context;
  let engine: MockedSearchEngine;
  let initialState: ContextInitialState | undefined;

  function initContext() {
    engine = buildMockSearchEngine(createMockState());
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
    expect(setContext).toHaveBeenCalledWith({foo: 'bar'});
  });
});
