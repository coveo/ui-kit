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
import type {Turn, TurnResponse} from './types.js';

function turn(
  overrides: Omit<Partial<Turn>, 'response'> & Pick<Turn, 'id'> & {response?: Partial<TurnResponse>}
): Turn {
  return {
    id: overrides.id,
    input: overrides.input ?? {},
    status: overrides.status ?? 'complete',
    response: {
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

  it('persists the session state, keyed by surface', () => {
    const result = serializeSession(
      state({turns: [turn({id: 'old'}), turn({id: 'active'})], state: {s1: {a: 1}, s2: {b: 2}}})
    );

    expect(result.state).toEqual({s1: {a: 1}, s2: {b: 2}});
    expect('state' in result.turns[0].response).toBe(false);
  });

  it('does not persist response.surfaces', () => {
    const t = turn({
      id: 't1',
      response: {
        activities: [],
        surfaces: [{surfaceId: 's', rootComponentType: 'CommerceSearch', isLoading: false}],
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

  it('round-trips the session state and continuity keys', () => {
    const original = state({
      turns: [turn({id: 'active'})],
      activeTurnId: 'active',
      sessionId: 'sid',
      sessionToken: 'tok',
      state: {s1: {a: 1}},
    });

    const restored = restoreSession(serializeSession(original));

    expect(restored.activeTurnId).toBe('active');
    expect(restored.sessionId).toBe('sid');
    expect(restored.sessionToken).toBe('tok');
    expect(restored.state).toEqual({s1: {a: 1}});
  });

  it('re-derives the renderer stream from every turn, in order', () => {
    const surfaceActivity = (id: string, messages: unknown[]) => ({
      id,
      kind: 'a2ui-surface',
      replace: false,
      payload: {messages},
    });
    const restored = restoreSession(
      serializeSession(
        state({
          turns: [
            turn({
              id: 't1',
              response: {
                activities: [
                  surfaceActivity('a1', [
                    {version: 'v1.0', createSurface: {surfaceId: 's1', catalogId: 'c'}},
                  ]),
                ],
              },
            }),
            turn({
              id: 't2',
              response: {
                activities: [
                  surfaceActivity('a2', [{version: 'v1.0', deleteSurface: {surfaceId: 's1'}}]),
                ],
              },
            }),
          ],
        })
      )
    );

    expect(restored.rendererStream?.messages).toEqual([
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c'}},
      {version: 'v0.9', deleteSurface: {surfaceId: 's1'}},
    ]);
  });

  it('downgrades a streaming turn to error while preserving its partial response', () => {
    const streaming = turn({
      id: 't1',
      status: 'streaming',
      response: {
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
        activities: [],
        surfaces: [{surfaceId: 's', rootComponentType: 'CommerceSearch', isLoading: false}],
      },
    });

    const restored = restoreSession(serializeSession(state({turns: [t], activeTurnId: 't1'})));

    // Surfaces are re-derived from `activities` via the fold's derivation, not
    // read from the (never-persisted) input value: empty activities → [].
    expect(restored.turns[0].response.surfaces).toEqual([]);
  });
});
