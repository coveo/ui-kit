/**
 * Operation resolver for Thermidor inline Component_State transport.
 *
 * Hand-written inline-TRANSPORT convention OWNED BY THE RUNTIME (moved out of
 * `@coveo/thermidor-schema` into `@coveo/thermidor` alongside {@link statePath}
 * so the runtime is decoupled from any concrete contract package). Given an
 * `updateDataModel` operation targeting a JSON Pointer `path` and the set of
 * node ids present in the surface, it decides whether the op resolves to a
 * present component's state subtree and, if so, whether it targets the whole
 * component state or a field beneath it.
 *
 * This is the pure mapping + resolver only. It performs NO value validation
 * (that is done by the core against the INJECTED per-component contract). On a
 * REJECTED result the caller leaves the data model unchanged.
 */

import {statePath} from './state-path.js';

/**
 * The minimal shape of an `updateDataModel` operation this resolver reads: it
 * only needs the target JSON Pointer `path`. The op value is intentionally not
 * inspected here (validation is a separate concern).
 */
export interface UpdateDataModelOperation {
  readonly path: string;
}

/**
 * Reason an operation could not be resolved to a present component's state
 * subtree.
 */
export type OperationRejectionReason =
  /** The path does not lie within the server-owned `/state` namespace. */
  | 'outside-state-namespace'
  /** The path is the bare `/state` root with no component id segment. */
  | 'bare-state-root'
  /**
   * The path is `/state/<id>` (or beneath it) but `<id>` is not a node id
   * present in the current surface.
   */
  | 'unknown-node-id';

/**
 * Successful resolution: the op targets a present component's state subtree.
 */
export interface ResolvedOperation {
  readonly resolved: true;
  /** The present node id whose state subtree the op targets. */
  readonly nodeId: string;
  /**
   * `true` when the path equals `statePath(nodeId)` (replaces the whole
   * Component_State); `false` when it is a sub-path beneath it (a partial
   * update of one or more fields).
   */
  readonly wholeComponent: boolean;
}

/**
 * Failed resolution: the op does not target any present component's state
 * subtree. The caller leaves the data model unchanged.
 */
export interface RejectedOperation {
  readonly resolved: false;
  /** The op path that could not be resolved. */
  readonly unresolvedPath: string;
  readonly reason: OperationRejectionReason;
}

/** Discriminated result of {@link resolveOperation}. */
export type OperationResolution = ResolvedOperation | RejectedOperation;

/**
 * Resolve an `updateDataModel` operation against the ids present in the
 * surface.
 *
 * Resolvable iff `path === statePath(id)` (whole-component) OR `path` starts
 * with `statePath(id) + "/"` (a sub-path beneath the state root) for some `id`
 * in `presentNodeIds`. Everything else is rejected:
 * - a path outside the `/state` namespace,
 * - the bare `/state` root with no id,
 * - a `/state/<id>...` path whose `<id>` is not a present node id,
 * - any other path that is neither `statePath(id)` nor beneath it for any
 *   present id.
 */
export function resolveOperation(
  op: UpdateDataModelOperation,
  presentNodeIds: Iterable<string>
): OperationResolution {
  const {path} = op;
  const ids = presentNodeIds instanceof Set ? presentNodeIds : new Set(presentNodeIds);

  // Fast path: exact whole-component match for a present id.
  for (const id of ids) {
    const root = statePath(id);
    if (path === root) {
      return {resolved: true, nodeId: id, wholeComponent: true};
    }
    if (path.startsWith(`${root}/`)) {
      return {resolved: true, nodeId: id, wholeComponent: false};
    }
  }

  // Not resolvable — classify the rejection reason.
  return {resolved: false, unresolvedPath: path, reason: classifyRejection(path)};
}

const STATE_ROOT = '/state';
const STATE_PREFIX = '/state/';

function classifyRejection(path: string): OperationRejectionReason {
  if (path === STATE_ROOT) {
    return 'bare-state-root';
  }
  if (!path.startsWith(STATE_PREFIX)) {
    return 'outside-state-namespace';
  }
  // Path is `/state/<something>...` but did not match any present node id.
  return 'unknown-node-id';
}
