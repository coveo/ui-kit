/**
 * Session serialization / restoration.
 *
 * A distinct, versioned persistence model for a session. The serialized shape
 * is intentionally NOT `= Turn` so persistence never silently couples to the
 * runtime domain shape; a persisted blob carries an integer `version` that is
 * bumped whenever the shape changes.
 *
 * Persistence scope — note `response.state` is persisted for the ACTIVE turn
 * only, an invariant coupled to the reserved historical-turn selector (ADR-011
 * + ADR-016, superseding ADR-013):
 *
 *   | Field                                       | Persist | Scope            |
 *   | ------------------------------------------- | ------- | ---------------- |
 *   | id, input, status, error                    | yes     | all turns        |
 *   | sessionId, sessionToken, activeTurnId       | yes     | session-level    |
 *   | response.activities                         | yes     | all turns        |
 *   | response.agent.{messages,reasoningSteps}    | yes     | all turns        |
 *   | response.state                              | yes     | active turn ONLY |
 *   | response.surfaces                           | no      | derived          |
 *
 * On restore:
 *   - `surfaces` is re-derived from each turn's persisted `activities` (never
 *     persisted, never an independent source of truth).
 *   - a turn persisted mid-stream (`status: 'streaming'`) is downgraded to
 *     `status: 'error'` (`'Stream was interrupted'`), preserving whatever
 *     partial `response` had streamed in.
 *   - non-active turns yield an empty (`{}`) `response.state` — their state was
 *     never persisted.
 *   - an unsupported `version` is rejected without partially populating a
 *     session.
 */

import {deriveSurfaces} from './fold.js';
import type {SessionStoreState} from './store.js';
import type {Activity, AgentMessage, ReasoningStep, Turn, TurnInput, TurnStatus} from './types.js';

/**
 * The current serialized-session shape version. Bumped whenever the persisted
 * shape changes. Restoration rejects any `version` that is not this value.
 */
export const SERIALIZED_SESSION_VERSION = 1;

/**
 * The error message used when a mid-stream turn is restored.
 */
export const STREAM_INTERRUPTED_ERROR = 'Stream was interrupted';

/**
 * The agent facet of a {@link SerializedTurn}'s response. Present only for
 * turns whose runtime `response.agent` was present.
 */
export interface SerializedTurnAgent {
  messages: AgentMessage[];
  reasoningSteps: ReasoningStep[];
}

/**
 * The persisted response of a {@link SerializedTurn}. `surfaces` is
 * intentionally absent — it is re-derived from `activities` on restore.
 * `state` is present only for the active turn.
 */
export interface SerializedTurnResponse {
  /** Persisted for ALL turns; the transcript source. */
  activities: Activity[];

  /** Persisted for ALL turns that had a runtime `response.agent`. */
  agent?: SerializedTurnAgent;

  /** Persisted for the ACTIVE turn ONLY; omitted for all others. */
  state?: Record<string, unknown>;
}

/**
 * A single persisted turn. Distinct from the runtime {@link Turn} shape so
 * persistence and runtime evolve independently.
 */
export interface SerializedTurn {
  id: string;
  input: TurnInput;
  status: TurnStatus;
  error?: string;
  response: SerializedTurnResponse;
}

/**
 * A versioned, persistable snapshot of a session. Distinct from the runtime
 * store state so the persisted shape never silently couples to the runtime
 * domain model.
 */
export interface SerializedSession {
  /** Integer `>= 1`; identifies the persisted shape. */
  version: number;
  /** Continuity key — lets a restored session continue the same conversation. */
  sessionId?: string;
  /** Continuity key for request-authentication continuity. */
  sessionToken?: string;
  activeTurnId?: string;
  turns: SerializedTurn[];
}

/**
 * Thrown when {@link restoreSession} is given a serialized session whose
 * `version` this client does not support. No session is partially populated
 * when this is thrown.
 */
export class UnsupportedSerializedSessionVersionError extends Error {
  constructor(readonly version: unknown) {
    super(
      `Unsupported serialized-session version: ${String(
        version
      )}. This client supports version ${SERIALIZED_SESSION_VERSION}.`
    );
    this.name = 'UnsupportedSerializedSessionVersionError';
  }
}

/**
 * Serializes a session's runtime store state into a versioned, persistable
 * {@link SerializedSession}.
 *
 * Persists `id`/`input`/`status`/`error` and `response.activities` for every
 * turn, `response.agent.{messages,reasoningSteps}` for turns that have an
 * agent, `response.state` for the active turn only, and session-level
 * `sessionId`/`sessionToken`/`activeTurnId`. Never persists `response.surfaces`.
 */
export function serializeSession(state: SessionStoreState<Turn>): SerializedSession {
  const {turns, activeTurnId, sessionId, sessionToken} = state;

  const serializedTurns: SerializedTurn[] = turns.map((turn) => {
    const response: SerializedTurnResponse = {
      activities: [...turn.response.activities],
    };

    if (turn.response.agent) {
      response.agent = {
        messages: [...turn.response.agent.messages],
        reasoningSteps: [...turn.response.agent.reasoningSteps],
      };
    }

    if (turn.id === activeTurnId) {
      response.state = {...turn.response.state};
    }

    const serialized: SerializedTurn = {
      id: turn.id,
      input: {...turn.input},
      status: turn.status,
      response,
    };
    if (turn.error !== undefined) {
      serialized.error = turn.error;
    }
    return serialized;
  });

  const session: SerializedSession = {
    version: SERIALIZED_SESSION_VERSION,
    turns: serializedTurns,
  };
  if (sessionId !== undefined) {
    session.sessionId = sessionId;
  }
  if (sessionToken !== undefined) {
    session.sessionToken = sessionToken;
  }
  if (activeTurnId !== undefined) {
    session.activeTurnId = activeTurnId;
  }
  return session;
}

/**
 * Restores a runtime store state from a versioned {@link SerializedSession}.
 *
 * Rejects an unsupported `version` (throwing
 * {@link UnsupportedSerializedSessionVersionError}) before building any turns,
 * so no session is partially populated. Otherwise reproduces every persisted
 * turn, re-derives `surfaces` from persisted `activities`, downgrades any
 * mid-stream turn to `error` while preserving its partial response, and yields
 * an empty `{}` state for every non-active turn.
 */
export function restoreSession(serialized: SerializedSession): SessionStoreState<Turn> {
  if (serialized.version !== SERIALIZED_SESSION_VERSION) {
    throw new UnsupportedSerializedSessionVersionError(serialized.version);
  }

  const {turns, activeTurnId, sessionId, sessionToken} = serialized;

  const restoredTurns: Turn[] = turns.map((turn) => {
    const isActive = turn.id === activeTurnId;

    const response: Turn['response'] = {
      // Non-active turns never persisted `state`; yield an empty snapshot.
      state: isActive && turn.response.state ? {...turn.response.state} : {},
      activities: [...turn.response.activities],
      surfaces: deriveSurfaces(turn.response.activities),
    };
    if (turn.response.agent) {
      response.agent = {
        messages: [...turn.response.agent.messages],
        reasoningSteps: [...turn.response.agent.reasoningSteps],
      };
    }

    const restored: Turn = {
      id: turn.id,
      input: {...turn.input},
      response,
      status: turn.status,
    };

    if (turn.status === 'streaming') {
      // A turn persisted mid-stream cannot resume; downgrade to error while
      // preserving the partial response exactly as persisted.
      restored.status = 'error';
      restored.error = STREAM_INTERRUPTED_ERROR;
    } else if (turn.error !== undefined) {
      restored.error = turn.error;
    }

    return restored;
  });

  const state: SessionStoreState<Turn> = {
    turns: restoredTurns,
  };
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
}
