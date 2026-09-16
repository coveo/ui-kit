import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {getActivityMetadata} from '@/src/internal/api/protocol/activity-metadata.js';
import type {
  A2uiState,
  Activity,
  DiscoveredSurface,
  ReasoningStep,
  ToolCallStep,
  Turn,
  TurnAgent,
  TurnInput,
  TurnResponse,
} from './types.js';

function emptyResponse(): TurnResponse {
  return {state: {}, activities: [], surfaces: []};
}

function cloneResponse(response: TurnResponse): TurnResponse {
  const next: TurnResponse = {
    state: response.state,
    activities: [...response.activities],
    surfaces: [...response.surfaces],
  };
  if (response.agent) {
    next.agent = {
      messages: [...response.agent.messages],
      reasoningSteps: [...response.agent.reasoningSteps],
    };
  }
  return next;
}

function cloneTurn(turn: Turn): Turn {
  const next: Turn = {
    id: turn.id,
    input: {...turn.input},
    response: cloneResponse(turn.response),
    status: turn.status,
  };
  if (turn.error !== undefined) {
    next.error = turn.error;
  }
  return next;
}

function ensureAgent(response: TurnResponse): TurnAgent {
  if (!response.agent) {
    response.agent = {messages: [], reasoningSteps: []};
  }
  return response.agent;
}

/**
 * The pure event fold: maps a single SSE activity into the active turn's
 * response, returning a new turn without mutating the input.
 *
 * This is the single place a {@link TurnResponse} is constructed from the
 * stream. It reproduces the reducer semantics that previously lived in the
 * generative slice + `dispatchStreamEvent`, reshaped to the ADR-010
 * `Turn`/`TurnResponse` model.
 *
 * The fold is pure: `(previousTurn, activity) → nextTurn`. Folding the same
 * activity sequence twice yields deeply-equal turns.
 */
export function foldActivity(previousTurn: Turn, activity: NormalizedStreamEvent): Turn {
  const turn = cloneTurn(previousTurn);
  const response = turn.response;

  switch (activity.type) {
    case 'TEXT_MESSAGE_START': {
      const agent = ensureAgent(response);
      agent.messages = [
        ...agent.messages,
        {content: '', role: (activity as {role?: string}).role ?? 'assistant'},
      ];
      return turn;
    }

    case 'TEXT_MESSAGE_CONTENT': {
      const agent = ensureAgent(response);
      const delta = (activity as {delta: string}).delta;
      if (agent.messages.length > 0) {
        const messages = [...agent.messages];
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = {...last, content: last.content + delta};
        agent.messages = messages;
      }
      return turn;
    }

    case 'TEXT_MESSAGE_END': {
      return turn;
    }

    case 'REASONING_MESSAGE_START': {
      const agent = ensureAgent(response);
      agent.reasoningSteps = [...agent.reasoningSteps, {type: 'reasoning', content: ''}];
      return turn;
    }

    case 'REASONING_MESSAGE_CONTENT': {
      const agent = ensureAgent(response);
      const delta = (activity as {delta: string}).delta;
      const steps = [...agent.reasoningSteps];
      if (!steps.some((s) => s.type === 'reasoning')) {
        steps.push({type: 'reasoning', content: ''});
      }
      const lastIndex = steps.map((s) => s.type).lastIndexOf('reasoning');
      const last = steps[lastIndex] as Extract<ReasoningStep, {type: 'reasoning'}>;
      steps[lastIndex] = {...last, content: last.content + delta};
      agent.reasoningSteps = steps;
      return turn;
    }

    case 'REASONING_MESSAGE_END': {
      // Lifecycle signal only.
      return turn;
    }

    case 'TOOL_CALL_START': {
      const agent = ensureAgent(response);
      const {toolCallId, toolCallName} = activity as {toolCallId: string; toolCallName: string};
      agent.reasoningSteps = [
        ...agent.reasoningSteps,
        {type: 'tool-call', id: toolCallId, name: toolCallName, args: '', status: 'calling'},
      ];
      return turn;
    }

    case 'TOOL_CALL_ARGS': {
      const agent = ensureAgent(response);
      const {toolCallId, delta} = activity as {toolCallId: string; delta: string};
      agent.reasoningSteps = mapToolCall(agent.reasoningSteps, toolCallId, (step) => ({
        ...step,
        args: step.args + delta,
      }));
      return turn;
    }

    case 'TOOL_CALL_END': {
      return turn;
    }

    case 'TOOL_CALL_RESULT': {
      const agent = ensureAgent(response);
      const {toolCallId, content} = activity as {toolCallId: string; content: string};
      agent.reasoningSteps = mapToolCall(agent.reasoningSteps, toolCallId, (step) => ({
        ...step,
        result: content,
        status: 'completed',
      }));
      return turn;
    }

    case 'ACTIVITY_SNAPSHOT': {
      const content = (activity as {content: unknown}).content as Record<string, unknown>;
      const metadata = getActivityMetadata(activity);
      response.activities = [
        ...response.activities,
        {
          id: (activity as {messageId?: string}).messageId ?? '',
          kind: (activity as {activityType?: string}).activityType ?? '',
          payload: content,
          replace: metadata.replace ?? false,
        },
      ];
      // Surfaces are a derived projection of `activities`: re-derive from the
      // full activity list so `response.surfaces` always agrees with a fresh
      // derivation off `response.activities`.
      response.surfaces = deriveSurfaces(response.activities);
      return turn;
    }

    case 'STATE_SNAPSHOT': {
      const snapshot = (activity as unknown as {snapshot?: unknown}).snapshot;
      if (snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)) {
        response.state = snapshot as A2uiState;
      }
      return turn;
    }

    case 'RUN_FINISHED': {
      turn.status = 'complete';
      return turn;
    }

    case 'turn_complete': {
      turn.status = 'complete';
      return turn;
    }

    case 'RUN_ERROR': {
      turn.status = 'error';
      turn.error = (activity as {message?: string}).message || 'An error occurred during the turn.';
      return turn;
    }

    case 'RUN_STARTED':
    case 'CUSTOM':
    case 'turn_started': {
      return turn;
    }

    default:
      return foldUnknown(turn, activity);
  }
}

function mapToolCall(
  steps: ReasoningStep[],
  toolCallId: string,
  update: (step: ToolCallStep) => ToolCallStep
): ReasoningStep[] {
  return steps.map((step) =>
    step.type === 'tool-call' && step.id === toolCallId ? update(step) : step
  );
}

function foldUnknown(turn: Turn, activity: NormalizedStreamEvent): Turn {
  const raw = activity as unknown as Record<string, unknown>;
  if (raw.type === 'error') {
    const errorObj = raw.error;
    turn.status = 'error';
    turn.error =
      typeof errorObj === 'object' && errorObj !== null && 'message' in errorObj
        ? String((errorObj as {message: unknown}).message)
        : 'A gateway error occurred.';
    return turn;
  }
  return turn;
}

/**
 * Creates the initial turn for an input, before any activity is folded.
 */
export function createTurn(id: string, input: TurnInput): Turn {
  return {id, input, response: emptyResponse(), status: 'streaming'};
}

/**
 * Folds an entire activity sequence over an initial turn. Convenience wrapper
 * used by determinism checks and the session runtime.
 */
export function foldActivities(initialTurn: Turn, activities: NormalizedStreamEvent[]): Turn {
  return activities.reduce(foldActivity, initialTurn);
}

/**
 * ============================================================================
 * Surface derivation (ADR-015 — RECORDED INTERIM DEBT)
 * ============================================================================
 *
 * RECORDED INTERIM DEBT (ADR-015): this block is the SINGLE location in the
 * package that walks a raw A2-UI activity payload (`activity.payload.messages`
 * → `createSurface` → resolve `rootId` against `components` → read
 * `props.componentType`) and the SINGLE location that knows the
 * `'commerce-search'` root-component-type magic string. Both persist until
 * server-surfaced typed routing lands (ADR-015 Option C, a separate future
 * ADR). No consumer — sample or internal `dispatchAction` — may walk activities
 * or re-spell this literal; they read the typed `response.surfaces` projection
 * and, for target resolution, {@link resolveTargetSurfaceId}.
 *
 * `surfaces` is a derived projection of `activities`, never an independent
 * source of truth: it is re-derived here from the full activity list so
 * dropping it and recomputing from `response.activities` yields a deeply-equal
 * list.
 */

/** ADR-015 interim: the root component type consumers/nav treat as commerce. */
const COMMERCE_SEARCH_ROOT_TYPE = 'commerce-search';

/** Activity kind carrying A2-UI surface `createSurface` messages. */
const SURFACE_ACTIVITY_KIND = 'a2ui-surface';

/**
 * Derives the ordered list of surfaces borne by a turn's activities. Every
 * entry carries a non-empty `surfaceId` and a non-empty `rootComponentType`;
 * turns with no surface-bearing activities yield an empty list.
 */
export function deriveSurfaces(activities: Activity[]): DiscoveredSurface[] {
  const surfaces: DiscoveredSurface[] = [];

  for (const activity of activities) {
    if (activity.kind !== SURFACE_ACTIVITY_KIND) {
      continue;
    }

    const messages = activity.payload['messages'];
    if (!Array.isArray(messages)) {
      continue;
    }

    for (const message of messages) {
      const surface = readSurface(message);
      if (surface !== null) {
        surfaces.push(surface);
      }
    }
  }

  return surfaces;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Reads a single `createSurface` message into a {@link DiscoveredSurface},
 * resolving the root component type from `createSurface.rootId` against
 * `createSurface.components`. Returns null when the message is not a well-formed
 * surface (missing surfaceId/rootId, no matching root component, or no root
 * `props.componentType`).
 */
function readSurface(message: unknown): DiscoveredSurface | null {
  if (!isRecord(message)) {
    return null;
  }

  const createSurface = message['createSurface'];
  if (!isRecord(createSurface)) {
    return null;
  }

  const surfaceId = createSurface['surfaceId'];
  const rootId = createSurface['rootId'];
  if (typeof surfaceId !== 'string' || surfaceId.length === 0 || typeof rootId !== 'string') {
    return null;
  }

  const components = createSurface['components'];
  if (!Array.isArray(components)) {
    return null;
  }

  const rootComponent = components.find((comp) => isRecord(comp) && comp['id'] === rootId);
  if (!isRecord(rootComponent)) {
    return null;
  }

  const props = rootComponent['props'];
  if (!isRecord(props)) {
    return null;
  }

  const rootComponentType = props['componentType'];
  if (typeof rootComponentType !== 'string' || rootComponentType.length === 0) {
    return null;
  }

  return {surfaceId, rootComponentType};
}

/**
 * Resolves the target `surfaceId` for the internal `dispatchAction` from a
 * turn's already-derived `response.surfaces`: the first surface whose root is a
 * commerce-search surface, or null when none exists. Consumers read
 * the typed projection here rather than walking activities.
 */
export function resolveTargetSurfaceId(surfaces: DiscoveredSurface[]): string | null {
  const target = surfaces.find(
    (surface) => surface.rootComponentType === COMMERCE_SEARCH_ROOT_TYPE
  );
  return target ? target.surfaceId : null;
}
