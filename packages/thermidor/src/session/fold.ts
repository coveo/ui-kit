import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {getActivityMetadata} from '@/src/internal/api/protocol/activity-metadata.js';
import {devWarn} from '@/src/internal/utils/dev-warn.js';
import {deriveA2uiV09Messages} from './a2ui-v09-projection.js';
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
  return {state: {}, activities: [], surfaces: [], a2uiMessages: []};
}

function cloneResponse(response: TurnResponse): TurnResponse {
  const next: TurnResponse = {
    state: response.state,
    activities: [...response.activities],
    surfaces: [...response.surfaces],
    a2uiMessages: [...response.a2uiMessages],
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
      const {messageId, role} = activity as {messageId: string; role?: string};
      agent.messages = [...agent.messages, {id: messageId, content: '', role: role ?? 'assistant'}];
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

      // A replace snapshot merges onto the same-`messageId` activity in place (see
      // mergeActivityPayload); a distinct or non-replace snapshot appends.
      const existingIndex =
        nextActivity.replace && nextActivity.id
          ? response.activities.findIndex((existing) => existing.id === nextActivity.id)
          : -1;
      if (nextActivity.kind === SURFACE_ACTIVITY_KIND) {
        warnSurfaceSpecErrors(
          response.surfaces,
          existingIndex === -1 ? undefined : response.activities[existingIndex].payload,
          content
        );
      }
      if (existingIndex === -1) {
        response.activities = [...response.activities, nextActivity];
      } else {
        const merged: Activity = {
          ...nextActivity,
          payload: mergeActivityPayload(
            response.activities[existingIndex].payload,
            nextActivity.payload
          ),
        };
        response.activities = response.activities.map((existing, index) =>
          index === existingIndex ? merged : existing
        );
      }

      // Surfaces are a derived projection of `activities`: re-derive from the
      // full activity list so `response.surfaces` always agrees with a fresh
      // derivation off `response.activities`.
      response.surfaces = deriveSurfaces(response.activities);
      // The renderer-facing v0.9 message stream is likewise a derived projection
      // of `activities`, re-derived from the full list for the same reason.
      response.a2uiMessages = deriveA2uiV09Messages(response.activities);
      // Validate the activity's `updateDataModel` ops in transit: conforming ops
      // are applied into `response.state`, others dropped. Details in applyInboundOps.
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

    case 'CUSTOM': {
      const {name, value} = activity as {name?: unknown; value?: unknown};
      if (typeof name !== 'string' || !name) {
        return turn;
      }
      response.activities = [
        ...response.activities,
        {id: '', kind: name, payload: customPayload(value), replace: false},
      ];
      return turn;
    }

    case 'RUN_STARTED':
    case 'turn_started': {
      return turn;
    }

    default:
      return foldUnknown(turn, activity);
  }
}

/**
 * A `CUSTOM` event's value as an activity payload: an object value is the payload itself, and any
 * other value is wrapped as `{value}`.
 */
function customPayload(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {value};
}

/**
 * Merges a superseding snapshot onto the one it replaces so an incremental snapshot (only the
 * slices that changed that turn) does not drop slices an earlier same-`messageId` snapshot wrote.
 * `next` wins per slice; unmentioned prior slices carry forward, except those of a surface `next`
 * creates or deletes, whose earlier topology and data model it ends. Carried writes replay before
 * `next`'s messages, so a newer write that overlaps an older one at another path (a whole-model
 * write over a carried `/isLoading`, or the reverse) still wins.
 */
function mergeActivityPayload(
  previous: Record<string, unknown>,
  next: Record<string, unknown>
): Record<string, unknown> {
  const nextMessages = next['messages'];
  const previousMessages = previous['messages'];
  if (!Array.isArray(nextMessages) || !Array.isArray(previousMessages)) {
    return next;
  }

  const nextSlices = new Set<string>();
  const restartedSurfaceIds = new Set<string>();
  let nextHasComponents = false;
  for (const message of nextMessages) {
    const lifecycleSurfaceId = surfaceLifecycleId(message);
    if (lifecycleSurfaceId !== null) {
      restartedSurfaceIds.add(lifecycleSurfaceId);
    }
    const slice = updateDataModelSlice(message);
    if (slice !== null) {
      nextSlices.add(slice);
    }
    if (isUpdateComponents(message)) {
      nextHasComponents = true;
    }
  }

  // Gateway topology is a whole-surface re-projection (never a per-node delta), so last one wins.
  const priorComponents = latestUpdateComponents(previousMessages);
  const carriedComponents =
    nextHasComponents ||
    priorComponents === null ||
    restartedSurfaceIds.has(operationSurfaceId(priorComponents, 'updateComponents') ?? '')
      ? []
      : [priorComponents];

  const carriedForward = previousMessages.filter((message) => {
    const slice = updateDataModelSlice(message);
    return (
      slice !== null &&
      !nextSlices.has(slice) &&
      !restartedSurfaceIds.has(operationSurfaceId(message, 'updateDataModel') ?? '')
    );
  });

  return {...next, messages: [...carriedComponents, ...carriedForward, ...nextMessages]};
}

/** The surface id an operation of `message` targets, or null when it is not that operation. */
function operationSurfaceId(message: unknown, operation: string): string | null {
  if (!isRecord(message)) {
    return null;
  }
  const body = message[operation];
  return isRecord(body) && typeof body['surfaceId'] === 'string' ? body['surfaceId'] : null;
}

/** The surface a `createSurface` or `deleteSurface` message starts or ends, or null. */
function surfaceLifecycleId(message: unknown): string | null {
  return (
    operationSurfaceId(message, 'createSurface') ?? operationSurfaceId(message, 'deleteSurface')
  );
}

function isUpdateComponents(message: unknown): boolean {
  return isRecord(message) && isRecord(message['updateComponents']);
}

function latestUpdateComponents(messages: readonly unknown[]): unknown {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (isUpdateComponents(messages[index])) {
      return messages[index];
    }
  }
  return null;
}

/**
 * A slice key for an updateDataModel op, or null when the message isn't one. Keyed by
 * `(surfaceId, path)`, not path alone: state is per-surface, so two surfaces can share a path.
 */
function updateDataModelSlice(message: unknown): string | null {
  if (!isRecord(message)) {
    return null;
  }
  const updateDataModel = message['updateDataModel'];
  if (!isRecord(updateDataModel)) {
    return null;
  }
  const surfaceId = updateDataModel['surfaceId'];
  const path = updateDataModel['path'];
  if (typeof surfaceId !== 'string' || typeof path !== 'string') {
    return null;
  }
  return `${surfaceId}\u0000${path}`;
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
 * Applies the just-arrived activity's `updateDataModel` ops to the turn's
 * `A2uiState` after in-transit validation. The node-identity registry is
 * re-derived from the folded activity list so the fold stays pure. Each op runs
 * through {@link validateInboundOp}: FORWARD writes the validated value at its
 * JSON Pointer within `state[surfaceId]` (shallow copy); DROP leaves state
 * untouched, so the prior rendered value stays. Returns the input reference
 * unchanged when nothing is forwarded.
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
 * root node's top-level `component` discriminant; `deleteSurface` and the
 * `isLoading` data-model flag drive the surface lifecycle). It persists until
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

/** The catalog-declared data-model flag marking a surface as a loading placeholder. */
const LOADING_FLAG = 'isLoading';

/**
 * Derives the ordered list of surfaces borne by a turn's activities. Every
 * entry carries a non-empty `surfaceId` and a non-empty `rootComponentType`;
 * turns with no surface-bearing activities yield an empty list. A `createSurface`
 * without a `catalogId` is ignored, as the v0.9 projection drops it.
 *
 * Messages are applied in stream order, following the A2-UI surface lifecycle:
 * `deleteSurface` removes a surface, and `isLoading` tracks the surface's
 * effective data model — its `createSurface.dataModel`, then any
 * `updateDataModel` written at `/` (or with no or an empty path) or at `/isLoading`. A data model may key the flag plainly
 * (`isLoading`) or as its JSON Pointer (`/isLoading`).
 */
export function deriveSurfaces(activities: Activity[]): DiscoveredSurface[] {
  const surfaces = new Map<string, DiscoveredSurface>();

  for (const activity of activities) {
    if (activity.kind !== SURFACE_ACTIVITY_KIND) {
      continue;
    }

    const messages = activity.payload['messages'];
    if (!Array.isArray(messages)) {
      continue;
    }

    for (const message of messages) {
      applySurfaceMessage(surfaces, message);
    }
  }

  return [...surfaces.values()];
}

function applySurfaceMessage(surfaces: Map<string, DiscoveredSurface>, message: unknown): void {
  if (!isRecord(message)) {
    return;
  }

  const surface = readSurface(message);
  if (surface !== null) {
    // A (re-)created surface is the newest one the agent drew, so it moves to the end rather than
    // keeping the position of the surface it replaces.
    surfaces.delete(surface.surfaceId);
    surfaces.set(surface.surfaceId, surface);
    return;
  }

  const deleteSurface = message['deleteSurface'];
  if (isRecord(deleteSurface) && typeof deleteSurface['surfaceId'] === 'string') {
    surfaces.delete(deleteSurface['surfaceId']);
    return;
  }

  const updateDataModel = message['updateDataModel'];
  if (!isRecord(updateDataModel) || typeof updateDataModel['surfaceId'] !== 'string') {
    return;
  }
  const existing = surfaces.get(updateDataModel['surfaceId']);
  const isLoading = readLoadingUpdate(updateDataModel['path'], updateDataModel['value']);
  if (existing !== undefined && isLoading !== undefined) {
    surfaces.set(existing.surfaceId, {...existing, isLoading});
  }
}

/**
 * Reads the loading flag an `updateDataModel` writes, or `undefined` when the write leaves it
 * untouched. Only a whole-model write (`/` or no path) and a direct `/isLoading` write reach it.
 */
function readLoadingUpdate(path: unknown, value: unknown): boolean | undefined {
  if (path === undefined || path === '' || path === '/') {
    return isRecord(value) && value[LOADING_FLAG] === true;
  }
  if (path === `/${LOADING_FLAG}`) {
    return value === true;
  }
  return undefined;
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

  // The v0.9 projection drops a surface without a catalog, so the renderer never draws it; a
  // consumer must not draw a placeholder for it either.
  const catalogId = createSurface['catalogId'];
  if (typeof catalogId !== 'string' || catalogId.length === 0) {
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

  const dataModel = createSurface['dataModel'];
  const isLoading = isRecord(dataModel) && readInlineLoadingFlag(dataModel);

  return {surfaceId, rootComponentType, isLoading};
}

/**
 * Warns, during development, about A2-UI spec errors in the `createSurface` messages of an incoming
 * surface snapshot: a surface without a catalog, which both projections ignore, and a surface
 * created again while it still exists, which `surfaces` collapses. Only the incoming snapshot is
 * checked, so each error is reported once rather than on every re-derivation. A replace snapshot
 * may re-send the `createSurface` of the activity it supersedes.
 */
function warnSurfaceSpecErrors(
  liveSurfaces: readonly DiscoveredSurface[],
  supersededPayload: Record<string, unknown> | undefined,
  payload: Record<string, unknown>
): void {
  const messages = payload['messages'];
  if (!Array.isArray(messages)) {
    return;
  }
  const liveIds = new Set(liveSurfaces.map((surface) => surface.surfaceId));
  const supersededMessages = supersededPayload?.['messages'];
  if (Array.isArray(supersededMessages)) {
    for (const message of supersededMessages) {
      const surfaceId = operationSurfaceId(message, 'createSurface');
      if (surfaceId !== null) {
        liveIds.delete(surfaceId);
      }
    }
  }
  for (const message of messages) {
    const deletedId = operationSurfaceId(message, 'deleteSurface');
    if (deletedId !== null) {
      liveIds.delete(deletedId);
      continue;
    }
    const surfaceId = operationSurfaceId(message, 'createSurface');
    if (surfaceId === null) {
      continue;
    }
    const catalogId = (message as {createSurface: Record<string, unknown>}).createSurface[
      'catalogId'
    ];
    if (typeof catalogId !== 'string' || catalogId.length === 0) {
      devWarn(
        `createSurface "${surfaceId}" has no catalogId (an A2-UI spec error); it is ignored.`
      );
      continue;
    }
    if (liveIds.has(surfaceId)) {
      devWarn(
        `createSurface "${surfaceId}" re-creates a surface that still exists without a deleteSurface (an A2-UI spec error).`
      );
    }
    liveIds.add(surfaceId);
  }
}

/**
 * Reads the loading flag an inline `createSurface.dataModel` seeds. The flag may be keyed plainly
 * (`isLoading`) or as its JSON Pointer (`/isLoading`); as in the v0.9 projection, the last of the
 * two wins.
 */
function readInlineLoadingFlag(dataModel: Record<string, unknown>): boolean {
  let isLoading = false;
  for (const [key, value] of Object.entries(dataModel)) {
    if (key === LOADING_FLAG || key === `/${LOADING_FLAG}`) {
      isLoading = value === true;
    }
  }
  return isLoading;
}
