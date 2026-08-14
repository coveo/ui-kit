import {describe, expect, it} from 'vitest';
import {createGenerativeActions} from './generative-actions.js';
import {createGenerativeSlice} from './generative-slice.js';

describe('generative slice', () => {
  const actions = createGenerativeActions('test');
  const reducer = createGenerativeSlice('test', actions).reducer;

  it('keeps a turn streaming when attaching a routed interface', () => {
    let state = reducer(
      undefined,
      actions.createTurn({id: 'turn-1', prompt: 'find shoes', status: 'streaming'})
    );

    state = reducer(
      state,
      actions.setRoutedInterface({turnId: 'turn-1', useCase: 'commerceSearch'})
    );

    expect(state.turns[0]).toEqual(
      expect.objectContaining({
        status: 'streaming',
        routedInterface: {useCase: 'commerceSearch'},
      })
    );
  });

  it('completes a routed turn only from the completion action', () => {
    let state = reducer(
      undefined,
      actions.createTurn({id: 'turn-1', prompt: 'find shoes', status: 'streaming'})
    );
    state = reducer(
      state,
      actions.setRoutedInterface({turnId: 'turn-1', useCase: 'commerceSearch'})
    );

    state = reducer(state, actions.completeTurn({turnId: 'turn-1'}));

    expect(state.turns[0].status).toBe('complete');
  });

  it('replaces activities by identity when their A2UI snapshot is replaced', () => {
    let state = reducer(
      undefined,
      actions.createTurn({id: 'turn-1', prompt: 'find shoes', status: 'streaming'})
    );
    state = reducer(state, actions.initAgentResponse({turnId: 'turn-1'}));
    state = reducer(
      state,
      actions.appendSurface({
        turnId: 'turn-1',
        surface: {messages: [{version: 'v1.0', createSurface: {surfaceId: 'surface-1'}}]},
        activity: {id: 'activity-1', replace: true},
      })
    );
    state = reducer(
      state,
      actions.appendSurface({
        turnId: 'turn-1',
        surface: {
          messages: [
            {
              version: 'v1.0',
              updateDataModel: {surfaceId: 'surface-1', path: '/', value: {products: []}},
            },
          ],
        },
        activity: {id: 'activity-1', replace: true},
      })
    );

    expect(state.turns[0].agentResponse?.surfaces).toEqual([
      {
        __thermidorActivityId: 'activity-1',
        messages: [
          {
            version: 'v1.0',
            updateDataModel: {surfaceId: 'surface-1', path: '/', value: {products: []}},
          },
        ],
      },
    ]);
  });

  it('clears a routed interface without removing the agent response', () => {
    let state = reducer(
      undefined,
      actions.createTurn({id: 'turn-1', prompt: 'find shoes', status: 'streaming'})
    );
    state = reducer(
      state,
      actions.setRoutedInterface({turnId: 'turn-1', useCase: 'commerceSearch'})
    );
    state = reducer(state, actions.initAgentResponse({turnId: 'turn-1'}));

    state = reducer(state, actions.clearRoutedInterface({turnId: 'turn-1'}));

    expect(state.turns[0]).toEqual(
      expect.objectContaining({
        agentResponse: {messages: [], surfaces: [], reasoningSteps: []},
        status: 'streaming',
      })
    );
    expect(state.turns[0].routedInterface).toBeUndefined();
  });
});
