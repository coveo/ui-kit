import {describe, expect, it} from 'vitest';
import {
  restoreSession,
  serializeSession,
  SERIALIZED_SESSION_VERSION,
  STREAM_INTERRUPTED_ERROR,
  UnsupportedSerializedSessionVersionError,
  type SerializedSession,
} from './serialize.js';
import type {SessionStoreState} from './store.js';
import type {Turn} from './types.js';

function turn(overrides: Partial<Turn> & Pick<Turn, 'id'>): Turn {
  return {
    id: overrides.id,
    input: overrides.input ?? {},
    status: overrides.status ?? 'complete',
    response: {
      state: {},
      activities: [],
      surfaces: [],
      ...overrides.response,
    },
    ...(overrides.error !== undefined ? {error: overrides.error} : {}),
  };
}

function state(overrides: Partial<SessionStoreState<Turn>> = {}): SessionStoreState<Turn> {
  return {turns: [], ...overrides};
}

describe('serializeSession', () => {
  it('stamps the current integer version >= 1', () => {
    const result = serializeSession(state());
    expect(result.version).toBe(SERIALIZED_SESSION_VERSION);
    expect(Number.isInteger(result.version)).toBe(true);
    expect(result.version).toBeGreaterThanOrEqual(1);
  });

  it('persists id/input/status/error and activities for every turn', () => {
    const t1 = turn({
      id: 't1',
      input: {prompt: 'hello'},
      status: 'error',
      error: 'boom',
      response: {
        state: {},
        activities: [{id: 'a1', kind: 'k', replace: false, payload: {}}],
        surfaces: [],
      },
    });
    const t2 = turn({id: 't2', input: {}, status: 'complete'});

    const result = serializeSession(state({turns: [t1, t2], activeTurnId: 't2'}));

    expect(result.turns[0]).toMatchObject({
      id: 't1',
      input: {prompt: 'hello'},
      status: 'error',
      error: 'boom',
    });
    expect(result.turns[0].response.activities).toEqual([
      {id: 'a1', kind: 'k', replace: false, payload: {}},
    ]);
    expect(result.turns[1].error).toBeUndefined();
  });

  it('persists agent facet only for turns that have an agent', () => {
    const withAgent = turn({
      id: 't1',
      response: {
        state: {},
        activities: [],
        surfaces: [],
        agent: {messages: [{content: 'hi', role: 'assistant'}], reasoningSteps: []},
      },
    });
    const withoutAgent = turn({id: 't2'});

    const result = serializeSession(state({turns: [withAgent, withoutAgent], activeTurnId: 't2'}));

    expect(result.turns[0].response.agent).toEqual({
      messages: [{content: 'hi', role: 'assistant'}],
      reasoningSteps: [],
    });
    expect(result.turns[1].response.agent).toBeUndefined();
  });

  it('persists response.state for the active turn only', () => {
    const active = turn({id: 'active', response: {state: {a: 1}, activities: [], surfaces: []}});
    const historical = turn({
      id: 'old',
      response: {state: {b: 2}, activities: [], surfaces: []},
    });

    const result = serializeSession(state({turns: [historical, active], activeTurnId: 'active'}));

    expect(result.turns[0].response.state).toBeUndefined();
    expect(result.turns[1].response.state).toEqual({a: 1});
  });

  it('does not persist response.surfaces', () => {
    const t = turn({
      id: 't1',
      response: {
        state: {},
        activities: [],
        surfaces: [{surfaceId: 's', rootComponentType: 'CommerceSearch'}],
      },
    });

    const result = serializeSession(state({turns: [t], activeTurnId: 't1'}));

    expect('surfaces' in result.turns[0].response).toBe(false);
  });

  it('persists session-level continuity keys', () => {
    const result = serializeSession(
      state({sessionId: 'sid', sessionToken: 'tok', activeTurnId: undefined})
    );
    expect(result.sessionId).toBe('sid');
    expect(result.sessionToken).toBe('tok');
  });
});

describe('restoreSession', () => {
  it('rejects an unsupported version without partially populating a session', () => {
    const bad = {version: 999, turns: []} as unknown as SerializedSession;
    expect(() => restoreSession(bad)).toThrow(UnsupportedSerializedSessionVersionError);
  });

  it('round-trips the active turn state and continuity keys', () => {
    const active = turn({id: 'active', response: {state: {a: 1}, activities: [], surfaces: []}});
    const original = state({
      turns: [active],
      activeTurnId: 'active',
      sessionId: 'sid',
      sessionToken: 'tok',
    });

    const restored = restoreSession(serializeSession(original));

    expect(restored.activeTurnId).toBe('active');
    expect(restored.sessionId).toBe('sid');
    expect(restored.sessionToken).toBe('tok');
    expect(restored.turns[0].response.state).toEqual({a: 1});
  });

  it('yields an empty state for non-active turns', () => {
    const active = turn({id: 'active', response: {state: {a: 1}, activities: [], surfaces: []}});
    const historical = turn({
      id: 'old',
      response: {state: {b: 2}, activities: [], surfaces: []},
    });

    const restored = restoreSession(
      serializeSession(state({turns: [historical, active], activeTurnId: 'active'}))
    );

    expect(restored.turns[0].response.state).toEqual({});
    expect(restored.turns[1].response.state).toEqual({a: 1});
  });

  it('downgrades a streaming turn to error while preserving its partial response', () => {
    const streaming = turn({
      id: 't1',
      status: 'streaming',
      response: {
        state: {a: 1},
        activities: [{id: 'a1', kind: 'k', replace: false, payload: {x: 1}}],
        surfaces: [],
        agent: {messages: [{content: 'partial', role: 'assistant'}], reasoningSteps: []},
      },
    });

    const restored = restoreSession(
      serializeSession(state({turns: [streaming], activeTurnId: 't1'}))
    );

    expect(restored.turns[0].status).toBe('error');
    expect(restored.turns[0].error).toBe(STREAM_INTERRUPTED_ERROR);
    expect(restored.turns[0].response.activities).toEqual([
      {id: 'a1', kind: 'k', replace: false, payload: {x: 1}},
    ]);
    expect(restored.turns[0].response.agent).toEqual({
      messages: [{content: 'partial', role: 'assistant'}],
      reasoningSteps: [],
    });
  });

  it('re-derives surfaces from activities rather than a persisted value', () => {
    const t = turn({
      id: 't1',
      response: {
        state: {},
        activities: [],
        surfaces: [{surfaceId: 's', rootComponentType: 'CommerceSearch'}],
      },
    });

    const restored = restoreSession(serializeSession(state({turns: [t], activeTurnId: 't1'})));

    // Surfaces are re-derived from `activities` via the fold's derivation, not
    // read from the (never-persisted) input value: empty activities → [].
    expect(restored.turns[0].response.surfaces).toEqual([]);
  });
});
