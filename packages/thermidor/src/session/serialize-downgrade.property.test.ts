import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {restoreSession, serializeSession, STREAM_INTERRUPTED_ERROR} from './serialize.js';
import type {SessionStoreState} from './store.js';
import type {Activity, AgentMessage, ReasoningStep, Turn} from './types.js';

/**
 * Streaming→error downgrade preserves partial response.
 *
 * For any Turn persisted mid-stream (`status: 'streaming'`), restore yields
 * `status: 'error'` with `error === 'Stream was interrupted'`, while the partial
 * `response` (activities, `agent.{messages,reasoningSteps}`, and — for the
 * active turn — `state`) is preserved unchanged from what was persisted.
 */

const NUM_RUNS = 200;

const shortText = fc.string({maxLength: 20});
const jsonRecord = fc.dictionary(
  fc.string({minLength: 1, maxLength: 8}),
  fc.jsonValue({maxDepth: 2})
);

const activityArbitrary: fc.Arbitrary<Activity> = fc.record({
  id: fc.string({minLength: 1, maxLength: 12}),
  kind: fc.string({minLength: 1, maxLength: 12}),
  replace: fc.boolean(),
  payload: jsonRecord as fc.Arbitrary<Record<string, unknown>>,
});

const agentMessageArbitrary: fc.Arbitrary<AgentMessage> = fc.record({
  content: shortText,
  role: fc.constantFrom('assistant', 'user', 'system'),
});

const reasoningStepArbitrary: fc.Arbitrary<ReasoningStep> = fc.oneof(
  fc.record({type: fc.constant('reasoning' as const), content: shortText}),
  fc.record({
    type: fc.constant('tool-call' as const),
    id: fc.string({minLength: 1, maxLength: 12}),
    name: fc.string({minLength: 1, maxLength: 12}),
    args: shortText,
    status: fc.constantFrom('calling' as const, 'completed' as const),
  })
);

const agentArbitrary = fc.record({
  messages: fc.array(agentMessageArbitrary, {maxLength: 6}),
  reasoningSteps: fc.array(reasoningStepArbitrary, {maxLength: 6}),
});

/**
 * A streaming Turn with an arbitrary partial response. `status` is forced to
 * `'streaming'`; `state` is arbitrary so the active-turn case exercises a
 * non-empty persisted snapshot.
 */
const streamingTurnArbitrary = (id: string): fc.Arbitrary<Turn> =>
  fc
    .record({
      input: fc.record({prompt: fc.option(shortText, {nil: undefined})}),
      state: jsonRecord as fc.Arbitrary<Record<string, unknown>>,
      activities: fc.array(activityArbitrary, {maxLength: 8}),
      agent: fc.option(agentArbitrary, {nil: undefined}),
    })
    .map(({input, state, activities, agent}): Turn => ({
      id,
      input,
      status: 'streaming',
      response: {
        state,
        activities,
        surfaces: [],
        a2uiMessages: [],
        ...(agent ? {agent} : {}),
      },
    }));

/**
 * A session of streaming turns with a distinct id each, one designated active.
 */
const streamingSessionArbitrary: fc.Arbitrary<{
  session: SessionStoreState<Turn>;
  activeTurnId: string;
}> = fc.integer({min: 1, max: 5}).chain((count) =>
  fc
    .tuple(
      fc.tuple(...Array.from({length: count}, (_, i) => streamingTurnArbitrary(`t${i}`))),
      fc.integer({min: 0, max: count - 1})
    )
    .map(([turns, activeIndex]) => {
      const activeTurnId = turns[activeIndex].id;
      return {
        session: {turns: [...turns], activeTurnId},
        activeTurnId,
      };
    })
);

describe('streaming→error downgrade preserves partial response', () => {
  it('downgrades every streaming turn to error while preserving its persisted partial response', () => {
    fc.assert(
      fc.property(streamingSessionArbitrary, ({session, activeTurnId}) => {
        const serialized = serializeSession(session);
        const restored = restoreSession(serialized);

        expect(restored.turns).toHaveLength(session.turns.length);

        for (let i = 0; i < restored.turns.length; i++) {
          const restoredTurn = restored.turns[i];
          const persistedTurn = serialized.turns[i];

          // Downgrade: streaming → error with the interrupted-stream marker.
          expect(restoredTurn.status).toBe('error');
          expect(restoredTurn.error).toBe(STREAM_INTERRUPTED_ERROR);

          // Partial response preserved unchanged from what was persisted.
          expect(restoredTurn.response.activities).toEqual(persistedTurn.response.activities);
          expect(restoredTurn.response.agent).toEqual(persistedTurn.response.agent);

          // `state` is persisted for the active turn only; a non-active turn's
          // persisted state is absent, so restore yields the empty snapshot.
          if (restoredTurn.id === activeTurnId) {
            expect(restoredTurn.response.state).toEqual(persistedTurn.response.state);
          } else {
            expect(persistedTurn.response.state).toBeUndefined();
            expect(restoredTurn.response.state).toEqual({});
          }
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
