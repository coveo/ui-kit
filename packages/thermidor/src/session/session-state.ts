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
  // Without an injected contract there is nothing to validate ops against, so
  // no op is forwarded and the state is left unchanged.
  if (!contracts) {
    return state;
  }
  const messages = content['messages'];
  if (!Array.isArray(messages)) {
    return state;
  }

  let registry: ReturnType<typeof deriveNodeIdentityRegistry> | undefined;
  let next = state;
  for (const message of messages) {
    const ended = endedSurfaceId(message);
    if (ended !== undefined) {
      if (ended in next) {
        const {[ended]: _ended, ...rest} = next;
        next = rest;
      }
      continue;
    }
    for (const op of readUpdateDataModelOps([message])) {
      registry ??= deriveNodeIdentityRegistry(activities);
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
  }
  return next;
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
