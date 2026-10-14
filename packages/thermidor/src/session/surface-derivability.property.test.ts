import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {deriveA2uiV09Messages} from './a2ui-v09-projection.js';
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
 * Surface ids drawn from a small pool, so lifecycle messages in a sequence target surfaces an
 * earlier message created.
 */
const surfaceIdArbitrary = fc.constantFrom('s-1', 's-2', 's-3');

/**
 * A well-formed `a2ui-surface` `createSurface` message, mirroring the shape `readSurface` walks:
 * `createSurface` with a `surfaceId` and a `components` entry carrying the canonical `root` node
 * (id: "root") whose top-level `component` discriminant is the (non-empty) root component type,
 * and optionally an inline data model declaring the loading flag. The A2-UI v1.0 envelope carries
 * no `rootId`.
 */
const createSurfaceArbitrary = fc
  .record({
    surfaceId: surfaceIdArbitrary,
    rootComponentType: fc.string({minLength: 1, maxLength: 12}),
    isLoading: fc.option(fc.boolean(), {nil: undefined}),
  })
  .map(({surfaceId, rootComponentType, isLoading}) => ({
    version: 'v1.0',
    createSurface: {
      surfaceId,
      components: [{id: 'root', component: rootComponentType}],
      ...(isLoading === undefined ? {} : {dataModel: {isLoading}}),
    },
  }));

const deleteSurfaceArbitrary = surfaceIdArbitrary.map((surfaceId) => ({
  version: 'v1.0',
  deleteSurface: {surfaceId},
}));

/** An `updateDataModel` at a path that reaches the loading flag: the whole model or the flag. */
const updateDataModelArbitrary = fc
  .record({
    surfaceId: surfaceIdArbitrary,
    path: fc.constantFrom<string | undefined>('/', '', undefined, '/isLoading'),
    isLoading: fc.boolean(),
  })
  .map(({surfaceId, path, isLoading}) => ({
    version: 'v1.0',
    updateDataModel: {
      surfaceId,
      ...(path === undefined ? {} : {path}),
      value: path === '/isLoading' ? isLoading : {isLoading},
    },
  }));

const lifecycleMessageArbitrary = fc.oneof(
  createSurfaceArbitrary,
  deleteSurfaceArbitrary,
  updateDataModelArbitrary
);

const surfaceSnapshot = (
  messageId: string,
  replace: boolean,
  messages: unknown[]
): NormalizedStreamEvent =>
  ({
    type: 'ACTIVITY_SNAPSHOT',
    messageId,
    activityType: 'a2ui-surface',
    content: {messages},
    replace,
  }) as NormalizedStreamEvent;

/**
 * A surface activity following the A2-UI surface lifecycle: creates, deletes, and data-model
 * writes, under a `messageId` shared with other activities so `replace` snapshots supersede them.
 */
const surfaceActivityArbitrary: fc.Arbitrary<NormalizedStreamEvent> = fc
  .record({
    messageId: fc.constantFrom('activity-1', 'activity-2'),
    replace: fc.boolean(),
    messages: fc.array(lifecycleMessageArbitrary, {minLength: 1, maxLength: 3}),
  })
  .map(({messageId, replace, messages}) => surfaceSnapshot(messageId, replace, messages));

/**
 * A closing activity that only creates surfaces, under its own `messageId`, so the turn ends
 * with at least one live surface.
 */
const closingSurfaceActivityArbitrary: fc.Arbitrary<NormalizedStreamEvent> = fc
  .array(createSurfaceArbitrary, {minLength: 1, maxLength: 3})
  .map((messages) => surfaceSnapshot('closing-activity', false, messages));

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
  })
) as fc.Arbitrary<NormalizedStreamEvent>;

/**
 * A sequence of surface lifecycle activities interleaved with other activities,
 * closed by surface-creating activities so surfaces are actually produced.
 */
const activitySequenceArbitrary: fc.Arbitrary<NormalizedStreamEvent[]> = fc
  .tuple(
    fc.array(otherActivityArbitrary, {maxLength: 8}),
    fc.array(fc.oneof(surfaceActivityArbitrary, otherActivityArbitrary), {
      minLength: 1,
      maxLength: 8,
    }),
    fc.array(closingSurfaceActivityArbitrary, {minLength: 1, maxLength: 3})
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
          expect(turn.response.a2uiMessages).toEqual(
            deriveA2uiV09Messages(turn.response.activities)
          );
          expect(foldActivities(createTurn(id, {prompt: 'hi'}), activities)).toEqual(turn);
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
            expect(restoredTurn.response.a2uiMessages).toEqual(originalTurn.response.a2uiMessages);
          });
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
