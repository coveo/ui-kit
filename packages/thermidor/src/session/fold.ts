import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {getActivityMetadata} from '@/src/internal/api/protocol/activity-metadata.js';
import type {ContractsSchema} from './contracts.js';
import {
  deriveNodeIdentityRegistry,
  readUpdateDataModelOps,
  validateInboundOp,
} from './in-transit-validation.js';
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
 * stream.
 *
 * The fold is pure: `(previousTurn, activity, contracts) → nextTurn`. The
 * injected `contracts` is a BOUND DEPENDENCY (never part of turn state) that
 * threads to in-transit validation; folding the same activity sequence twice
 * with the same contracts yields deeply-equal turns.
 *
 * `contracts` is optional: when absent (activity sequences that carry no
 * `updateDataModel` state ops), no inbound op is validated or applied, so
 * `response.state` is left as it would be with an empty contract. The session
 * runtime always threads `config.contracts`.
 */
export function foldActivity(
  previousTurn: Turn,
  activity: NormalizedStreamEvent,
  contracts?: ContractsSchema
): Turn {
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
      const nextActivity: Activity = {
        id: (activity as {messageId?: string}).messageId ?? '',
        kind: (activity as {activityType?: string}).activityType ?? '',
        payload: content,
        replace: metadata.replace ?? false,
      };

      // A snapshot is the latest full version of the content for its
      // `messageId`. When `replace` is set and an activity with the same
      // (non-empty) `messageId` already exists, supersede it in place —
      // preserving its position — rather than appending a second entry.
      // Otherwise append. This keeps a re-emitted surface from leaving a stale
      // duplicate in `activities` (and thus in the derived `surfaces`).
      const existingIndex =
        nextActivity.replace && nextActivity.id
          ? response.activities.findIndex((existing) => existing.id === nextActivity.id)
          : -1;
      if (existingIndex === -1) {
        response.activities = [...response.activities, nextActivity];
      } else {
        response.activities = response.activities.map((existing, index) =>
          index === existingIndex ? nextActivity : existing
        );
      }

      // Surfaces are a derived projection of `activities`: re-derive from the
      // full activity list so `response.surfaces` always agrees with a fresh
      // derivation off `response.activities`.
      response.surfaces = deriveSurfaces(response.activities);
      // In-transit validation of the just-arrived activity's `updateDataModel`
      // ops. A conforming op is forwarded (applied into `response.state` at its
      // op path); a non-conforming, unresolved, or no-`*State`-schema op is
      // dropped, leaving `response.state` unchanged. The node-identity registry
      // is re-derived from the full activity list so the fold stays pure.
      response.state = applyInboundOps(response.state, response.activities, content, contracts);
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
export function foldActivities(
  initialTurn: Turn,
  activities: NormalizedStreamEvent[],
  contracts?: ContractsSchema
): Turn {
  return activities.reduce(
    (turn, activity) => foldActivity(turn, activity, contracts),
    initialTurn
  );
}

/**
 * Applies the `updateDataModel` ops carried by the just-arrived activity's
 * `content.messages[]` to the turn's `A2uiState`, after In_Transit_Validation.
 *
 * The node-identity registry is re-derived from the full folded activity list
 * so the fold stays pure and deterministic. Each op is routed through
 * {@link validateInboundOp}: a FORWARD decision writes the (validated) value at
 * the op's JSON Pointer WITHIN its surface's data model (`state[surfaceId]`) in
 * a shallow copy of the state; a DROP decision leaves the state untouched, so
 * the renderer keeps its prior data-model value and the previously rendered UI
 * for that component remains displayed.
 *
 * `Thermidor_Core` keeps no state store: `state` here is the turn's forwarded
 * projection, not a merged component-state store. Returns the input state
 * reference unchanged when no op is forwarded, so an activity that forwards
 * nothing does not perturb `response.state`.
 */
function applyInboundOps(
  state: A2uiState,
  activities: Activity[],
  content: Record<string, unknown>,
  contracts: ContractsSchema | undefined
): A2uiState {
  // Without an injected contract there is nothing to validate ops against, so
  // no op is forwarded and the state is left unchanged.
  if (!contracts) {
    return state;
  }
  const messages = content['messages'];
  if (!Array.isArray(messages)) {
    return state;
  }
  const ops = readUpdateDataModelOps(messages);
  if (ops.length === 0) {
    return state;
  }

  const registry = deriveNodeIdentityRegistry(activities);
  let next = state;
  for (const op of ops) {
    const decision = validateInboundOp(op, registry, contracts);
    if (decision.kind === 'forward') {
      // Per surface: every surface has a `root` node, so a shared node id would
      // collide at one top-level pointer without scoping the write by surface.
      const surfaceState = isRecord(next[op.surfaceId]) ? (next[op.surfaceId] as A2uiState) : {};
      next = {
        ...next,
        [op.surfaceId]: setAtPointer(surfaceState, decision.path, decision.value),
      };
    }
  }
  return next;
}

/**
 * Writes `value` at the RFC 6901 JSON Pointer `path` in a structurally shared
 * copy of `state`, creating intermediate objects as needed and leaving sibling
 * values untouched — the same leaf-write, sibling-preserving semantics the
 * frozen renderer's data model applies. Never mutates the input `state`.
 */
function setAtPointer(state: A2uiState, path: string, value: unknown): A2uiState {
  const segments = path
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (segments.length === 0) {
    return isRecord(value) ? (value as A2uiState) : state;
  }

  const root: Record<string, unknown> = {...state};
  let cursor = root;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const existing = cursor[segment];
    const clone: Record<string, unknown> = isRecord(existing) ? {...existing} : {};
    cursor[segment] = clone;
    cursor = clone;
  }
  cursor[segments[segments.length - 1]] = value;
  return root;
}

/**
 * Surface derivation — RECORDED INTERIM DEBT (ADR-015).
 *
 * This block is the SINGLE location in the
 * package that walks a raw A2-UI activity payload (`activity.payload.messages`
 * → `createSurface` → find the canonical `root` node in `components` → read the
 * root node's top-level `component` discriminant). It persists until
 * server-surfaced typed routing lands (ADR-015 Option C, a separate future
 * ADR). No consumer — sample or internal `dispatchAction` — may walk activities;
 * they read the typed `response.surfaces` projection.
 *
 * `surfaces` is a derived projection of `activities`, never an independent
 * source of truth: it is re-derived here from the full activity list so
 * dropping it and recomputing from `response.activities` yields a deeply-equal
 * list.
 */

/**
 * The A2-UI v1.0 canonical surface root node id. `createSurface` implicitly mounts the reserved
 * `Surface` container with `child: "root"`, so the surface's root is the node whose `id` is this
 * value. The envelope carries no `rootId`.
 */
const ROOT_COMPONENT_ID = 'root';

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
 * resolving the root component type from the canonical `root` node in
 * `createSurface.components` (the A2-UI v1.0 node with `id: "root"`) and reading its
 * top-level `component` discriminant (PascalCase). Returns null when the message is not
 * a well-formed surface (missing surfaceId, no `root` component, or no root `component`
 * discriminant).
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
  if (typeof surfaceId !== 'string' || surfaceId.length === 0) {
    return null;
  }

  const components = createSurface['components'];
  if (!Array.isArray(components)) {
    return null;
  }

  // A2-UI v1.0: the surface's root is the canonical node with `id: "root"` mounted under the
  // implicit `Surface` container. The `createSurface` envelope carries no `rootId`.
  const rootComponent = components.find(
    (comp) => isRecord(comp) && comp['id'] === ROOT_COMPONENT_ID
  );
  if (!isRecord(rootComponent)) {
    return null;
  }

  const rootComponentType = rootComponent['component'];
  if (typeof rootComponentType !== 'string' || rootComponentType.length === 0) {
    return null;
  }

  return {surfaceId, rootComponentType};
}
