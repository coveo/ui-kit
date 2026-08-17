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

  it('stores activities as opaque protocol-neutral payloads', () => {
    let state = reducer(
      undefined,
      actions.createTurn({id: 'turn-1', prompt: 'find shoes', status: 'streaming'})
    );
    state = reducer(state, actions.initAgentResponse({turnId: 'turn-1'}));
    state = reducer(
      state,
      actions.appendActivity({
        turnId: 'turn-1',
        activity: {
          id: 'activity-1',
          kind: 'a2ui-surface',
          payload: {messages: []},
          replace: true,
        },
      })
    );

    expect(state.turns[0].agentResponse?.activities).toEqual([
      {
        id: 'activity-1',
        kind: 'a2ui-surface',
        payload: {messages: []},
        replace: true,
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
        agentResponse: {state: {}, messages: [], activities: [], reasoningSteps: []},
        status: 'streaming',
      })
    );
    expect(state.turns[0].routedInterface).toBeUndefined();
  });
});
