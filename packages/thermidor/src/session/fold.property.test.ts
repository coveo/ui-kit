import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {createTurn, foldActivities} from './fold.js';

/**
 * Fold determinism.
 *
 * The Fold is a pure reduction `(previousTurn, activity) → nextTurn`. Folding
 * the same activity sequence twice over the same initial turn must produce
 * deeply-equal Turn values.
 */

const NUM_RUNS = 200;

const toolCallId = fc.string({minLength: 1, maxLength: 12});
const shortText = fc.string({maxLength: 20});

/**
 * Generates a single arbitrary activity spanning the event kinds the fold
 * handles: agent messages, reasoning, tool calls, activity/state snapshots, and
 * the run/turn lifecycle (including error) events.
 */
const activityArbitrary: fc.Arbitrary<NormalizedStreamEvent> = fc.oneof(
  fc.record({type: fc.constant('RUN_STARTED')}),
  fc.record({type: fc.constant('turn_started')}),
  fc.record({type: fc.constant('TEXT_MESSAGE_START'), role: fc.constant('assistant')}),
  fc.record({type: fc.constant('TEXT_MESSAGE_CONTENT'), delta: shortText}),
  fc.record({type: fc.constant('TEXT_MESSAGE_END')}),
  fc.record({type: fc.constant('REASONING_MESSAGE_START')}),
  fc.record({type: fc.constant('REASONING_MESSAGE_CONTENT'), delta: shortText}),
  fc.record({type: fc.constant('REASONING_MESSAGE_END')}),
  fc.record({
    type: fc.constant('TOOL_CALL_START'),
    toolCallId,
    toolCallName: fc.string({minLength: 1, maxLength: 12}),
  }),
  fc.record({type: fc.constant('TOOL_CALL_ARGS'), toolCallId, delta: shortText}),
  fc.record({type: fc.constant('TOOL_CALL_END'), toolCallId}),
  fc.record({type: fc.constant('TOOL_CALL_RESULT'), toolCallId, content: shortText}),
  fc.record({
    type: fc.constant('ACTIVITY_SNAPSHOT'),
    messageId: fc.string({minLength: 1, maxLength: 12}),
    activityType: fc.string({minLength: 1, maxLength: 12}),
    content: fc.dictionary(fc.string({minLength: 1, maxLength: 8}), fc.jsonValue({maxDepth: 2})),
    replace: fc.boolean(),
  }),
  fc.record({
    type: fc.constant('STATE_SNAPSHOT'),
    snapshot: fc.dictionary(fc.string({minLength: 1, maxLength: 8}), fc.jsonValue({maxDepth: 2})),
  }),
  fc.record({type: fc.constant('CUSTOM')}),
  fc.record({type: fc.constant('RUN_FINISHED')}),
  fc.record({type: fc.constant('turn_complete')}),
  fc.record({type: fc.constant('RUN_ERROR'), message: shortText}),
  fc.record({type: fc.constant('UNKNOWN'), event: shortText, payload: fc.jsonValue({maxDepth: 2})})
) as fc.Arbitrary<NormalizedStreamEvent>;

const activitySequenceArbitrary = fc.array(activityArbitrary, {maxLength: 40});

describe('fold determinism', () => {
  it('folds the same activity sequence twice into deeply-equal turns', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 12}),
        fc.record({prompt: fc.option(shortText, {nil: undefined})}),
        activitySequenceArbitrary,
        (id, input, activities) => {
          const first = foldActivities(createTurn(id, input), activities);
          const second = foldActivities(createTurn(id, input), activities);
          expect(second).toStrictEqual(first);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('does not mutate the initial turn when folding', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 12}),
        activitySequenceArbitrary,
        (id, activities) => {
          const initial = createTurn(id, {});
          const snapshot = structuredClone(initial);
          foldActivities(initial, activities);
          expect(initial).toStrictEqual(snapshot);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
