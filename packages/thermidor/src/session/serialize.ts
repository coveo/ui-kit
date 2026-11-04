/**
 * Session serialization / restoration.
 *
 * A distinct, versioned persistence model for a session. The serialized shape
 * is intentionally NOT `= Turn` so persistence never silently couples to the
 * runtime domain shape; a persisted blob carries an integer `version` that is
 * bumped whenever the shape changes.
 *
 * Persistence scope (ADR-018):
 *
 *   | Field                                       | Persist | Scope            |
 *   | ------------------------------------------- | ------- | ---------------- |
 *   | id, input, status, error                    | yes     | all turns        |
 *   | initialization (activities, status, error)  | yes     | session-level    |
 *   | sessionId, sessionToken, activeTurnId       | yes     | session-level    |
 *   | response.activities                         | yes     | all turns        |
 *   | response.agent.{messages,reasoningSteps}    | yes     | all turns        |
 *   | state (validated data model)                | yes     | session-level    |
 *   | response.surfaces                           | no      | derived          |
 *   | renderer stream (`a2uiMessages`)            | no      | derived          |
 *
 * On restore:
 *   - `surfaces` and the renderer stream are re-derived from the persisted
 *     `activities` of the initialization, then of each turn, in order (never
 *     persisted, never an independent source of truth).
 *   - a turn or initialization persisted mid-stream (`status: 'streaming'`) is
 *     downgraded to `status: 'error'` (`'Stream was interrupted'`), preserving
 *     whatever partial `response` had streamed in.
 *   - an unsupported `version` is rejected without partially populating a
 *     session.
 */

import {
  EMPTY_RENDERER_STREAM,
  appendToRendererStream,
  convertA2uiMessages,
  type RendererStream,
} from './a2ui-v09-projection.js';
import {deriveSurfaces, SURFACE_ACTIVITY_KIND} from './fold.js';
import {sessionActivities, type SessionRuns} from './session-surfaces.js';
import type {SessionStoreState} from './store.js';
import type {
  Activity,
  AgentMessage,
  ReasoningStep,
  SessionInitialization,
  Turn,
  TurnInput,
  TurnStatus,
} from './types.js';

/**
 * The current serialized-session shape version. Bumped whenever the persisted
 * shape changes. Restoration rejects any `version` that is not this value.
 */
export const SERIALIZED_SESSION_VERSION = 4;

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
 * intentionally absent: it is re-derived from `activities` on restore.
 */
export interface SerializedTurnResponse {
  /** Persisted for ALL turns; the transcript source. */
  activities: Activity[];

  /** Persisted for ALL turns that had a runtime `response.agent`. */
  agent?: SerializedTurnAgent;
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

/** The persisted run of the session's `initialize` action. */
export interface SerializedInitialization {
  /** The run's activities, which hold the surfaces it created. */
  activities: Activity[];
  status: TurnStatus;
  /** Present when `status === 'error'`, absent otherwise. */
  error?: string;
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
  /** The run of the `initialize` action that opened the session, when it sent one. */
  initialization?: SerializedInitialization;
  turns: SerializedTurn[];
  /** The session's validated data model, keyed by surface id. */
  state?: Record<string, unknown>;
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
 * agent, and session-level `initialization`, `sessionId`/`sessionToken`/`activeTurnId`
 * and `state`. Never persists the derived `response.surfaces` or renderer stream.
 */
export function serializeSession(state: SessionStoreState<Turn>): SerializedSession {
  const {turns, initialization, activeTurnId, sessionId, sessionToken, state: sessionState} = state;

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
  if (initialization !== undefined) {
    session.initialization = {
      activities: [...initialization.activities],
      status: initialization.status,
      ...(initialization.error === undefined ? {} : {error: initialization.error}),
    };
  }
  if (sessionState !== undefined && Object.keys(sessionState).length > 0) {
    session.state = {...sessionState};
  }
  return session;
}

/**
 * Restores a runtime store state from a versioned {@link SerializedSession}.
 *
 * Rejects an unsupported `version` (throwing
 * {@link UnsupportedSerializedSessionVersionError}) before building any turns,
 * so no session is partially populated. Otherwise reproduces every persisted
 * turn, the initialization and the session's `state`, re-derives `surfaces` and
 * the renderer stream from the persisted `activities`, and downgrades any
 * mid-stream turn or initialization to `error` while preserving what it holds.
 */
export function restoreSession(serialized: SerializedSession): SessionStoreState<Turn> {
  if (serialized.version !== SERIALIZED_SESSION_VERSION) {
    throw new UnsupportedSerializedSessionVersionError(serialized.version);
  }

  const {turns, activeTurnId, sessionId, sessionToken} = serialized;

  const restoredTurns: Turn[] = turns.map((turn) => {
    const response: Turn['response'] = {
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

  const initialization =
    serialized.initialization && restoreInitialization(serialized.initialization);

  const state: SessionStoreState<Turn> = {
    turns: restoredTurns,
    state: serialized.state ? {...serialized.state} : {},
    rendererStream: deriveRendererStream({turns: restoredTurns, initialization}),
  };
  if (initialization !== undefined) {
    state.initialization = initialization;
  }
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

function restoreInitialization(initialization: SerializedInitialization): SessionInitialization {
  const activities = [...initialization.activities];
  if (initialization.status === 'streaming') {
    return {activities, status: 'error', error: STREAM_INTERRUPTED_ERROR};
  }
  return {
    activities,
    status: initialization.status,
    ...(initialization.error === undefined ? {} : {error: initialization.error}),
  };
}

function deriveRendererStream(runs: SessionRuns): RendererStream {
  let stream = EMPTY_RENDERER_STREAM;
  for (const activity of sessionActivities(runs)) {
    const messages = activity.kind === SURFACE_ACTIVITY_KIND ? activity.payload['messages'] : null;
    if (Array.isArray(messages)) {
      stream = appendToRendererStream(stream, convertA2uiMessages(messages));
    }
  }
  return stream;
}
