import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {createTurn, deriveSurfaces, foldActivities} from './fold.js';
import {restoreSession, serializeSession} from './serialize.js';
import type {SessionStoreState} from './store.js';
import type {Turn} from './types.js';

/**
 * Surfaces are derivable.
 *
 * `response.surfaces` is a derived projection of `response.activities`, never an
 * independent source of truth. For any turn, `response.surfaces` deeply equals
 * `deriveSurfaces(response.activities)`: dropping `surfaces` and re-deriving
 * from `activities` reproduces an identical list. The restore path exercises
 * the same invariant end-to-end — `restoreSession(serializeSession(state))`
 * (which never persists `surfaces`) reproduces each turn's surfaces from its
 * persisted `activities`, identical to a fresh derivation.
 */

const NUM_RUNS = 200;

const shortText = fc.string({maxLength: 20});

/**
 * A well-formed `a2ui-surface` `createSurface` activity payload, mirroring the
 * shape `readSurface` walks: `messages[].createSurface` with a `surfaceId`, a
 * `rootId`, and a `components` entry whose `id` matches `rootId` and whose
 * top-level `component` discriminant is the (non-empty) root component type.
 * Yields exactly one `DiscoveredSurface` per message when folded.
 */
const surfaceMessageArbitrary = fc
  .record({
    surfaceId: fc.string({minLength: 1, maxLength: 12}),
    rootComponentType: fc.string({minLength: 1, maxLength: 12}),
  })
  .map(({surfaceId, rootComponentType}) => {
    const rootId = `${surfaceId}-root`;
    return {
      version: 'v1.0',
      createSurface: {
        surfaceId,
        rootId,
        components: [{id: rootId, component: rootComponentType}],
      },
    };
  });

const surfaceActivityArbitrary: fc.Arbitrary<NormalizedStreamEvent> = fc
  .array(surfaceMessageArbitrary, {minLength: 1, maxLength: 3})
  .map(
    (messages) =>
      ({
        type: 'ACTIVITY_SNAPSHOT',
        messageId: 'surface-activity',
        activityType: 'a2ui-surface',
        content: {messages},
        replace: false,
      }) as NormalizedStreamEvent
  );

/**
 * Non-surface activities the fold handles, mixed in so surfaces are discovered
 * amongst unrelated events rather than in isolation.
 */
const otherActivityArbitrary: fc.Arbitrary<NormalizedStreamEvent> = fc.oneof(
  fc.record({type: fc.constant('TEXT_MESSAGE_START'), role: fc.constant('assistant')}),
  fc.record({type: fc.constant('TEXT_MESSAGE_CONTENT'), delta: shortText}),
  fc.record({type: fc.constant('REASONING_MESSAGE_CONTENT'), delta: shortText}),
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
  })
) as fc.Arbitrary<NormalizedStreamEvent>;

/**
 * A sequence guaranteed to contain at least one surface-bearing activity (so
 * surfaces are actually produced), interleaved with other activities.
 */
const activitySequenceArbitrary: fc.Arbitrary<NormalizedStreamEvent[]> = fc
  .tuple(
    fc.array(otherActivityArbitrary, {maxLength: 8}),
    fc.array(fc.oneof(surfaceActivityArbitrary, otherActivityArbitrary), {
      minLength: 1,
      maxLength: 8,
    }),
    fc.array(surfaceActivityArbitrary, {minLength: 1, maxLength: 3})
  )
  .map(([prefix, middle, surfaces]) => [...prefix, ...middle, ...surfaces]);

describe('surfaces are derivable', () => {
  it('folds a turn whose response.surfaces equals deriveSurfaces(response.activities)', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 12}),
        activitySequenceArbitrary,
        (id, activities) => {
          const turn = foldActivities(createTurn(id, {prompt: 'hi'}), activities);

          expect(turn.response.surfaces).toEqual(deriveSurfaces(turn.response.activities));
          // The generators guarantee at least one well-formed surface, so this
          // is not the trivially-empty case.
          expect(turn.response.surfaces.length).toBeGreaterThan(0);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('re-derives each restored turn surfaces from persisted activities, identical to the original derivation', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({minLength: 1, maxLength: 12}), {minLength: 1, maxLength: 5}),
        fc.array(activitySequenceArbitrary, {minLength: 1, maxLength: 5}),
        (ids, activitySequences) => {
          const turns: Turn[] = ids.map((id, index) => {
            const sequence = activitySequences[index % activitySequences.length];
            const folded = foldActivities(createTurn(id, {prompt: 'hi'}), sequence);
            return {...folded, status: 'complete'};
          });

          const original: SessionStoreState<Turn> = {
            turns,
            activeTurnId: ids[0],
          };

          const restored = restoreSession(serializeSession(original));

          expect(restored.turns).toHaveLength(turns.length);
          restored.turns.forEach((restoredTurn, index) => {
            const originalTurn = turns[index];
            // Restore never persists surfaces; they are re-derived from the
            // persisted activities and must match a fresh derivation as well as
            // the original turn's surfaces.
            expect(restoredTurn.response.surfaces).toEqual(
              deriveSurfaces(restoredTurn.response.activities)
            );
            expect(restoredTurn.response.surfaces).toEqual(originalTurn.response.surfaces);
          });
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
