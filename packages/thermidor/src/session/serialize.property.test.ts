import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {restoreSession, serializeSession} from './serialize.js';
import type {SessionStoreState} from './store.js';
import type {Activity, AgentMessage, ReasoningStep, Turn, TurnStatus} from './types.js';

/**
 * Serialize/restore round-trip (active turn).
 *
 * For any session store state, `restoreSession(serializeSession(s))` preserves:
 * every turn's `id`/`input`/`status`/`error`, every turn's `response.activities`
 * and `response.agent.{messages,reasoningSteps}`, the ACTIVE turn's
 * `response.state`, and session-level `sessionId`/`sessionToken`/`activeTurnId`.
 * Non-active turns' `state` is intentionally dropped (restored as `{}`).
 *
 * The `streaming` status is deliberately excluded from the generated turns: a
 * mid-stream turn is downgraded to `error` on restore, which is the concern of
 * the streaming→error downgrade round-trip, not this equality round-trip.
 */

const NUM_RUNS = 200;

const jsonRecord = fc.dictionary(
  fc.string({minLength: 1, maxLength: 8}),
  fc.jsonValue({maxDepth: 2})
) as fc.Arbitrary<Record<string, unknown>>;

const activityArbitrary: fc.Arbitrary<Activity> = fc.record({
  id: fc.string({minLength: 1, maxLength: 12}),
  kind: fc.string({minLength: 1, maxLength: 12}),
  replace: fc.boolean(),
  payload: jsonRecord,
});

const agentMessageArbitrary: fc.Arbitrary<AgentMessage> = fc.record({
  content: fc.string({maxLength: 20}),
  role: fc.string({minLength: 1, maxLength: 12}),
});

const reasoningStepArbitrary: fc.Arbitrary<ReasoningStep> = fc.oneof(
  fc.record({
    type: fc.constant<'reasoning'>('reasoning'),
    content: fc.string({maxLength: 20}),
  }),
  fc.record({
    type: fc.constant<'tool-call'>('tool-call'),
    id: fc.string({minLength: 1, maxLength: 12}),
    name: fc.string({minLength: 1, maxLength: 12}),
    args: fc.string({maxLength: 20}),
    status: fc.constantFrom<'calling' | 'completed'>('calling', 'completed'),
  })
);

/**
 * Excludes `'streaming'` on purpose: the streaming → error downgrade is the
 * downgrade round-trip's concern and would break this equality round-trip.
 */
const nonStreamingStatus: fc.Arbitrary<TurnStatus> = fc.constantFrom<TurnStatus>(
  'complete',
  'error'
);

/**
 * Generates a single arbitrary Turn with the given `id`. A `status: 'error'`
 * turn carries an `error` string; other statuses omit it. The optional agent
 * facet is present about half the time.
 */
function turnArbitrary(id: string): fc.Arbitrary<Turn> {
  return fc
    .record({
      status: nonStreamingStatus,
      prompt: fc.option(fc.string({maxLength: 20}), {nil: undefined}),
      state: jsonRecord,
      activities: fc.array(activityArbitrary, {maxLength: 8}),
      agent: fc.option(
        fc.record({
          messages: fc.array(agentMessageArbitrary, {maxLength: 5}),
          reasoningSteps: fc.array(reasoningStepArbitrary, {maxLength: 5}),
        }),
        {nil: undefined}
      ),
      error: fc.string({maxLength: 20}),
    })
    .map(({status, prompt, state, activities, agent, error}) => {
      const turn: Turn = {
        id,
        input: prompt === undefined ? {} : {prompt},
        status,
        response: {
          state,
          activities,
          surfaces: [],
          a2uiMessages: [],
          ...(agent ? {agent} : {}),
        },
      };
      if (status === 'error') {
        turn.error = error;
      }
      return turn;
    });
}

/**
 * Generates an arbitrary session store state: a turn list with unique ids, an
 * `activeTurnId` that is either one of those ids or `undefined`, and optional
 * continuity keys.
 */
const sessionStateArbitrary: fc.Arbitrary<SessionStoreState<Turn>> = fc
  .uniqueArray(fc.string({minLength: 1, maxLength: 12}), {maxLength: 8})
  .chain((ids) =>
    fc.record({
      turns: fc.tuple(...ids.map((id) => turnArbitrary(id))),
      activeTurnId:
        ids.length === 0
          ? fc.constant<string | undefined>(undefined)
          : fc.constantFrom<string | undefined>(...ids, undefined),
      sessionId: fc.option(fc.string({minLength: 1, maxLength: 12}), {nil: undefined}),
      sessionToken: fc.option(fc.string({minLength: 1, maxLength: 12}), {nil: undefined}),
    })
  )
  .map(({turns, activeTurnId, sessionId, sessionToken}) => {
    const state: SessionStoreState<Turn> = {turns};
    if (activeTurnId !== undefined) {
      state.activeTurnId = activeTurnId;
    }
    if (sessionId !== undefined) {
      state.sessionId = sessionId;
    }
    if (sessionToken !== undefined) {
      state.sessionToken = sessionToken;
    }
    return state;
  });

describe('serialize/restore round-trip (active turn)', () => {
  it('preserves every turn id/input/status/error across a round-trip', () => {
    fc.assert(
      fc.property(sessionStateArbitrary, (original) => {
        const restored = restoreSession(serializeSession(original));

        expect(restored.turns).toHaveLength(original.turns.length);
        original.turns.forEach((turn, index) => {
          const roundTripped = restored.turns[index];
          expect(roundTripped.id).toBe(turn.id);
          expect(roundTripped.input).toEqual(turn.input);
          expect(roundTripped.status).toBe(turn.status);
          expect(roundTripped.error).toBe(turn.error);
        });
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('preserves every turn activities and agent facet across a round-trip', () => {
    fc.assert(
      fc.property(sessionStateArbitrary, (original) => {
        const restored = restoreSession(serializeSession(original));

        original.turns.forEach((turn, index) => {
          const roundTripped = restored.turns[index];
          expect(roundTripped.response.activities).toEqual(turn.response.activities);
          expect(roundTripped.response.agent).toEqual(turn.response.agent);
        });
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('reproduces the active turn state and drops non-active state to {}', () => {
    fc.assert(
      fc.property(sessionStateArbitrary, (original) => {
        const restored = restoreSession(serializeSession(original));

        original.turns.forEach((turn, index) => {
          const roundTripped = restored.turns[index];
          if (turn.id === original.activeTurnId) {
            expect(roundTripped.response.state).toEqual(turn.response.state);
          } else {
            expect(roundTripped.response.state).toEqual({});
          }
        });
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('preserves session-level continuity keys across a round-trip', () => {
    fc.assert(
      fc.property(sessionStateArbitrary, (original) => {
        const restored = restoreSession(serializeSession(original));

        expect(restored.activeTurnId).toBe(original.activeTurnId);
        expect(restored.sessionId).toBe(original.sessionId);
        expect(restored.sessionToken).toBe(original.sessionToken);
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
