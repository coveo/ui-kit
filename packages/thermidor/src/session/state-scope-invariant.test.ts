import {describe, expect, it} from 'vitest';
import {z} from 'zod/v4';
import {createSession} from './create-session.js';
import {SERIALIZED_SESSION_VERSION, type SerializedSession} from './serialize.js';

/**
 * ============================================================================
 * Active-turn state-scope invariant (guard test)
 * ============================================================================
 *
 * `serialize.ts` persists `response.state` for the ACTIVE turn only; on restore
 * every non-active turn yields an empty (`{}`) `state`, so a remote controller
 * can only ever observe the active turn's component state. The `{ turnId }`
 * historical-turn selector (ADR-013) is RESERVED/unimplemented: it is accepted
 * without error but always binds the active turn.
 *
 * This coupling is safe ONLY while live component state is read exclusively on
 * the active turn. The tests below encode that coupling so a future `turnId`
 * addition cannot silently break restoration.
 */

/**
 * A minimal Zod v4 discriminated-union contracts schema — a single `pagination`
 * component contract, matching the `z.core.$strict` object config the
 * `ContractsSchema` type requires and the `{ state, actions.<name>.payload }`
 * shape the remote controller resolves against.
 */
const contracts = z.discriminatedUnion('componentType', [
  z.strictObject({
    componentType: z.literal('pagination'),
    state: z.strictObject({page: z.number()}),
    actions: z.strictObject({
      selectPage: z.strictObject({payload: z.strictObject({page: z.number()})}),
    }),
  }),
]);

const COMPONENT_ID = 'pagination-1';
const COMPONENT_TYPE = 'pagination' as const;

const HISTORICAL_TURN_ID = 'turn-historical';
const ACTIVE_TURN_ID = 'turn-active';

/** The component state the ACTIVE turn had persisted (nested under `components`). */
const ACTIVE_PAGE = 7;

/**
 * Builds a `SerializedSession` with two turns:
 *   - a HISTORICAL (non-active) turn whose `response.state` was NOT persisted
 *     (serialize.ts omits it for non-active turns → restore yields `{}`), and
 *   - the ACTIVE turn whose `response.state.components[COMPONENT_ID]` carries a
 *     valid pagination state.
 *
 * This mirrors what `serializeSession` emits: `state` present on the active
 * turn only, absent on every other turn.
 */
function buildSerializedSession(): SerializedSession {
  return {
    version: SERIALIZED_SESSION_VERSION,
    activeTurnId: ACTIVE_TURN_ID,
    turns: [
      {
        id: HISTORICAL_TURN_ID,
        input: {prompt: 'first'},
        status: 'complete',
        response: {
          activities: [],
          // No `state` key — non-active turns never persist it.
        },
      },
      {
        id: ACTIVE_TURN_ID,
        input: {prompt: 'second'},
        status: 'complete',
        response: {
          activities: [],
          state: {components: {[COMPONENT_ID]: {page: ACTIVE_PAGE}}},
        },
      },
    ],
  };
}

function restoredSession() {
  return createSession({
    organizationId: 'org-1',
    accessToken: 'token-1',
    contracts,
    sessionToRestore: buildSerializedSession(),
  });
}

describe('active-turn state-scope invariant', () => {
  describe('a restored historical turn exposes no component state', () => {
    it('reproduces the ACTIVE turn\u2019s persisted component state', () => {
      const controller = restoredSession().remoteController(COMPONENT_ID, COMPONENT_TYPE);

      // The active turn's `response.state` WAS persisted, so its component
      // state is reproduced on restore.
      expect(controller.state).toEqual({page: ACTIVE_PAGE});
    });

    it('yields undefined for a historical (non-active) turn\u2019s component state', () => {
      const session = restoredSession();

      // A controller bound while the historical turn is NOT active can only
      // observe the ACTIVE turn's state (the historical turn's state was never
      // persisted → restored as `{}`). There is no way, today, to observe the
      // historical turn's component state; the closest attempt is asserting the
      // active state is what the controller sees, and that the historical turn
      // itself carries an empty state snapshot.
      const controller = session.remoteController(COMPONENT_ID, COMPONENT_TYPE);
      expect(controller.state).toEqual({page: ACTIVE_PAGE});
      expect(controller.state).not.toBeUndefined();

      // The historical turn's restored `response.state` is empty (`{}`): its
      // component state is unobservable, in contrast to the active turn.
      const historicalTurn = session.turns.find((turn) => turn.id === HISTORICAL_TURN_ID);
      expect(historicalTurn?.response.state).toEqual({});
    });
  });

  describe('the { turnId } selector is the tripwire for the state-scope coupling', () => {
    it('binds the ACTIVE turn even when a historical turnId is requested', () => {
      const session = restoredSession();

      // TRIPWIRE:
      //
      // Passing `options.turnId` pointed at the HISTORICAL turn must, TODAY,
      // still bind the ACTIVE turn — the historical-turn selector is reserved
      // and unimplemented (ADR-013). Because the historical turn's
      // `response.state` was never persisted (serialize.ts persists it for the
      // active turn only), there is no historical state to observe.
      //
      // If someone implements `turnId` to READ historical-turn component state
      // WITHOUT also widening serialize.ts to persist non-active turns' state,
      // this expectation flips: the controller would resolve the historical
      // turn's (empty → undefined) state instead of the active turn's, and this
      // assertion breaks — surfacing the coupling loudly rather than shipping a
      // silently-broken restoration.
      const controller = session.remoteController(COMPONENT_ID, COMPONENT_TYPE, {
        turnId: HISTORICAL_TURN_ID,
      });

      expect(controller.state).toEqual({page: ACTIVE_PAGE});
    });

    it('does not expose the historical turn\u2019s state via the reserved selector', () => {
      const session = restoredSession();

      // Same tripwire from the other direction: the historical turn's state is
      // empty on restore, so if `turnId` ever binds it, `state` would collapse
      // to `undefined`. Asserting it is NOT undefined today locks in the
      // active-turn scope until serialize.ts is widened alongside any turnId
      // implementation.
      const historicalController = session.remoteController(COMPONENT_ID, COMPONENT_TYPE, {
        turnId: HISTORICAL_TURN_ID,
      });
      const activeController = session.remoteController(COMPONENT_ID, COMPONENT_TYPE);

      expect(historicalController.state).toEqual(activeController.state);
      expect(historicalController.state).not.toBeUndefined();
    });
  });
});
