import {describe, expect, it} from 'vitest';
import {createTestEngine, createTestInterface} from '@/test/test-utils.js';
import {getOrCreateGenerativeActions} from './generative-actions.js';
import {getOrCreateGenerativeSlice} from './generative-slice.js';

describe('generative slice', () => {
  const iface = createTestInterface(createTestEngine(), 'test');
  const actions = getOrCreateGenerativeActions(iface);
  const reducer = getOrCreateGenerativeSlice(iface).reducer;

  it('completes a turn only from the completion action', () => {
    let state = reducer(
      undefined,
      actions.createTurn({id: 'turn-1', prompt: 'find shoes', status: 'streaming'})
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

  it('clears the turn response without leaving stale agent state', () => {
    let state = reducer(
      undefined,
      actions.createTurn({id: 'turn-1', prompt: 'find shoes', status: 'streaming'})
    );
    state = reducer(state, actions.initAgentResponse({turnId: 'turn-1'}));

    state = reducer(state, actions.clearTurnResponse({turnId: 'turn-1'}));

    expect(state.turns[0].agentResponse).toBeUndefined();
    expect(state.turns[0].status).toBe('streaming');
  });
});
