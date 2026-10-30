/**
 * The session's component state (ADR-018): the validated data model of every surface, keyed by
 * surface id, across every turn.
 */

import type {ContractsSchema} from './contracts.js';
import {
  deriveNodeIdentityRegistry,
  readUpdateDataModelOps,
  validateInboundOp,
} from './in-transit-validation.js';
import type {A2uiState, Activity} from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Applies the just-arrived activity's messages to the session's `A2uiState`, in order. A
 * `createSurface` or `deleteSurface` ends the surface's stored state, as it ends the renderer's data
 * model, so a surface re-created under a live id starts empty. Its `updateDataModel` ops are applied
 * after in-transit validation. The node-identity registry is
 * re-derived from `activities`, every turn's folded activities in order, so an
 * op on a surface an earlier turn created resolves (ADR-018). Each op runs
 * through {@link validateInboundOp}: FORWARD writes the validated value at its
 * JSON Pointer within `state[surfaceId]` (shallow copy); DROP leaves state
 * untouched, so the prior rendered value stays. Returns the input reference
 * unchanged when nothing is forwarded.
 */
export function applyInboundOps(
  state: A2uiState,
  activities: readonly Activity[],
  content: Record<string, unknown>,
  contracts: ContractsSchema | undefined
): A2uiState {
  let next = state;
  for (const write of inboundWrites(activities, content, contracts)) {
    if (write.kind === 'end') {
      if (write.surfaceId in next) {
        const {[write.surfaceId]: _ended, ...rest} = next;
        next = rest;
      }
      continue;
    }
    // Per surface: every surface has a `root` node, so a shared node id would
    // collide at one top-level pointer without scoping the write by surface.
    const surfaceState = isRecord(next[write.surfaceId])
      ? (next[write.surfaceId] as A2uiState)
      : {};
    next = {
      ...next,
      [write.surfaceId]: setAtPointer(surfaceState, write.path, write.value),
    };
  }
  return next;
}

type InboundWrite =
  | {kind: 'end'; surfaceId: string}
  | {kind: 'write'; surfaceId: string; path: string; value: unknown};

/** The surfaces an activity's messages end and the validated writes they forward, in order. */
function* inboundWrites(
  activities: readonly Activity[],
  content: Record<string, unknown>,
  contracts: ContractsSchema | undefined
): Generator<InboundWrite> {
  // Without an injected contract there is nothing to validate ops against, so
  // no op is forwarded and the state is left unchanged.
  const messages = content['messages'];
  if (!contracts || !Array.isArray(messages)) {
    return;
  }

  let registry: ReturnType<typeof deriveNodeIdentityRegistry> | undefined;
  for (const message of messages) {
    const ended = endedSurfaceId(message);
    if (ended !== undefined) {
      yield {kind: 'end', surfaceId: ended};
      continue;
    }
    for (const op of readUpdateDataModelOps([message])) {
      registry ??= deriveNodeIdentityRegistry(activities);
      const decision = validateInboundOp(op, registry, contracts);
      if (decision.kind === 'forward') {
        yield {kind: 'write', surfaceId: op.surfaceId, path: decision.path, value: decision.value};
      }
    }
  }
}

/**
 * The writes of answers applied without being recorded in a run (ADR-020): by surface id, the
 * validated value at each JSON Pointer, in the order written. In memory only: never serialized.
 */
export type UnrecordedState = ReadonlyMap<string, ReadonlyMap<string, unknown>>;

export const EMPTY_UNRECORDED_STATE: UnrecordedState = new Map();

/** An unrecorded answer's `updateDataModel` messages that pass validation, and their writes. */
export interface UnrecordedWrites {
  messages: readonly unknown[];
  writes: readonly {surfaceId: string; path: string; value: unknown}[];
}

/**
 * Keeps the messages of an unrecorded answer that only update the data model of a node the
 * recorded runs hold, and whose value its contract accepts, so the state and the renderer stream
 * receive the same writes. Any other message, such as a new surface or component, is left out.
 */
export function acceptUnrecordedWrites(
  messages: readonly unknown[],
  activities: readonly Activity[],
  contracts: ContractsSchema
): UnrecordedWrites {
  const accepted: unknown[] = [];
  const writes: {surfaceId: string; path: string; value: unknown}[] = [];
  let registry: ReturnType<typeof deriveNodeIdentityRegistry> | undefined;
  for (const message of messages) {
    const [op] = isDataModelUpdate(message) ? readUpdateDataModelOps([message]) : [];
    if (!op) {
      continue;
    }
    registry ??= deriveNodeIdentityRegistry(activities);
    const decision = validateInboundOp(op, registry, contracts);
    if (decision.kind === 'forward') {
      accepted.push(message);
      writes.push({surfaceId: op.surfaceId, path: decision.path, value: decision.value});
    }
  }
  return {messages: accepted, writes};
}

function isDataModelUpdate(message: unknown): boolean {
  return (
    isRecord(message) &&
    'updateDataModel' in message &&
    !('createSurface' in message || 'updateComponents' in message || 'deleteSurface' in message)
  );
}

/** Adds `writes` on top of the layer; a write replaces the layer's values at and under its path. */
export function applyUnrecordedWrites(
  layer: UnrecordedState,
  writes: UnrecordedWrites['writes']
): UnrecordedState {
  if (writes.length === 0) {
    return layer;
  }
  const next = new Map(layer);
  for (const {surfaceId, path, value} of writes) {
    const surfaceWrites = new Map(
      [...(next.get(surfaceId) ?? [])].filter(([written]) => !isAtOrUnder(written, path))
    );
    surfaceWrites.set(path, value);
    next.set(surfaceId, surfaceWrites);
  }
  return next;
}

/**
 * Removes from the layer what a recorded activity's messages replace: the surfaces they end, and
 * the values at, above or under a path they write.
 */
export function releaseUnrecordedState(
  layer: UnrecordedState,
  activities: readonly Activity[],
  content: Record<string, unknown>,
  contracts: ContractsSchema | undefined
): UnrecordedState {
  if (layer.size === 0) {
    return layer;
  }
  let next = layer;
  for (const write of inboundWrites(activities, content, contracts)) {
    const surfaceWrites = next.get(write.surfaceId);
    if (!surfaceWrites) {
      continue;
    }
    const kept =
      write.kind === 'end'
        ? []
        : [...surfaceWrites].filter(
            ([written]) => !isAtOrUnder(written, write.path) && !isAtOrUnder(write.path, written)
          );
    if (kept.length === surfaceWrites.size) {
      continue;
    }
    const released = new Map(next);
    if (kept.length === 0) {
      released.delete(write.surfaceId);
    } else {
      released.set(write.surfaceId, new Map(kept));
    }
    next = released;
  }
  return next;
}

/** The recorded state with the unrecorded layer's writes on top. */
export function overlayUnrecordedState(state: A2uiState, layer: UnrecordedState): A2uiState {
  if (layer.size === 0) {
    return state;
  }
  let next = state;
  for (const [surfaceId, writes] of layer) {
    let surfaceState = isRecord(next[surfaceId]) ? (next[surfaceId] as A2uiState) : {};
    for (const [path, value] of writes) {
      surfaceState = setAtPointer(surfaceState, path, value);
    }
    next = {...next, [surfaceId]: surfaceState};
  }
  return next;
}

function isAtOrUnder(path: string, ancestor: string): boolean {
  return path === ancestor || path.startsWith(`${ancestor}/`);
}

/** The surface a `createSurface` or `deleteSurface` message starts or ends, if it is one. */
function endedSurfaceId(message: unknown): string | undefined {
  if (!isRecord(message)) {
    return undefined;
  }
  const operation = message['createSurface'] ?? message['deleteSurface'];
  return isRecord(operation) && typeof operation['surfaceId'] === 'string'
    ? operation['surfaceId']
    : undefined;
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
