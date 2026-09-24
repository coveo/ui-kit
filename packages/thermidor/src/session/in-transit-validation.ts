/**
 * In-transit validation of inbound `updateDataModel` operations — INTERNAL.
 *
 * It is the single place `Thermidor_Core` validates an inbound `updateDataModel`
 * op against the per-component contract before the op is forwarded to the
 * renderer. It is entirely internal to the core: the Consumer never invokes,
 * imports, or becomes aware of it.
 *
 * Two responsibilities, both pure:
 *
 * 1. {@link deriveNodeIdentityRegistry} re-derives a per-surface
 *    NODE-IDENTITY REGISTRY (`surfaceId -> (nodeId -> component discriminant)`)
 *    from the folded activity list. This registry holds ONLY id→component-type
 *    identity used to ROUTE an op to the owning component's contract. It is NOT
 *    a `Component_State` store and never holds state values — `Thermidor_Core`
 *    keeps no state store.
 *
 * 2. {@link validateInboundOp} resolves an op via the core's local
 *    `resolveOperation`, resolves the owning component's `*State` Zod schema via
 *    {@link findComponentContract} from the INJECTED `contracts`, and validates
 *    the op value:
 *    - whole-component op (path === `statePath(id)`) → the whole `*State`
 *      schema;
 *    - partial op (sub-path) → the `State_Field_Schema`, the sub-schema of the
 *      `*State` object at the target sub-path, WITHOUT reconstructing a merged
 *      whole state.
 *    A conforming op is FORWARDED; a non-conforming op, a REJECTED op, and an op
 *    whose component has no `*State` schema are DROPPED.
 *
 * Because both functions are pure and derive the registry from the activity
 * list (never from module-level mutable state), folding the same activity
 * sequence twice yields deeply-equal turns — the fold's determinism guarantee
 * is preserved.
 */

import type {ContractsSchema, ObjectSchema, ParsableSchema} from './contracts.js';
import {resolveOperation} from './resolve-operation.js';
import {statePath} from './state-path.js';
import type {Activity} from './types.js';

/** Activity kind carrying A2-UI v1.0 messages (`createSurface`, `updateDataModel`, ...). */
const A2UI_ACTIVITY_KIND = 'a2ui-surface';

/**
 * A per-surface node-identity registry: for each `surfaceId`, the map from a
 * node `id` present in that surface to its PascalCase `component` discriminant.
 * Used ONLY to route an op to the owning component's contract; never a state
 * store.
 */
export type NodeIdentityRegistry = Map<string, Map<string, string>>;

/**
 * The minimal shape of an inbound `updateDataModel` op this module reads: the
 * target JSON Pointer `path` and the op `value` to validate. A whole-component
 * op carries the whole `*State` value; a partial op carries the sub-path value.
 */
export interface InboundUpdateDataModelOp {
  readonly surfaceId: string;
  readonly path: string;
  readonly value: unknown;
}

/**
 * The decision produced by {@link validateInboundOp}: either FORWARD the op
 * (the value conforms to the contract and may flow into the renderer's data
 * model) or DROP it (rejected, non-conforming, or no `*State` schema), leaving
 * the renderer's data model unchanged.
 */
export type InTransitDecision =
  | {readonly kind: 'forward'; readonly path: string; readonly value: unknown}
  | {readonly kind: 'drop'; readonly reason: InTransitDropReason};

/** Why an op was dropped, for a dev-only diagnostic. */
type InTransitDropReason =
  /** `resolveOperation` rejected the path (outside `/state`, unknown/absent id). */
  | 'unresolved-path'
  /** No node-identity entry for the resolved node id (surface not yet folded). */
  | 'unknown-node-identity'
  /** No generated `*State` schema for the resolved component. */
  | 'no-state-schema'
  /** The op value failed validation against the contract. */
  | 'invalid-value';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Re-derives the per-surface node-identity registry from a turn's folded
 * activity list. Walks each `a2ui-surface` activity's `messages[]`, collecting
 * `id -> component` from every `createSurface` (its `components[]`) and every
 * `updateComponents` (its `components[]`) message. Later messages for the same
 * `(surfaceId, id)` overwrite earlier identity, mirroring the renderer's
 * last-write-wins composition.
 *
 * Pure: same activities in, deeply-equal registry out; no module-level state.
 */
export function deriveNodeIdentityRegistry(activities: readonly Activity[]): NodeIdentityRegistry {
  const registry: NodeIdentityRegistry = new Map();

  for (const activity of activities) {
    if (activity.kind !== A2UI_ACTIVITY_KIND) {
      continue;
    }
    const messages = activity.payload['messages'];
    if (!Array.isArray(messages)) {
      continue;
    }
    for (const message of messages) {
      registerMessage(registry, message);
    }
  }

  return registry;
}

function registerMessage(registry: NodeIdentityRegistry, message: unknown): void {
  if (!isRecord(message)) {
    return;
  }
  // `createSurface` and `updateComponents` both carry a `surfaceId` and a
  // `components[]` list of nodes whose identity we record.
  const envelope = message['createSurface'] ?? message['updateComponents'];
  if (!isRecord(envelope)) {
    return;
  }
  const surfaceId = envelope['surfaceId'];
  const components = envelope['components'];
  if (typeof surfaceId !== 'string' || surfaceId.length === 0 || !Array.isArray(components)) {
    return;
  }

  let nodes = registry.get(surfaceId);
  if (!nodes) {
    nodes = new Map();
    registry.set(surfaceId, nodes);
  }
  for (const component of components) {
    registerNode(nodes, component);
  }
}

function registerNode(nodes: Map<string, string>, node: unknown): void {
  if (!isRecord(node)) {
    return;
  }
  // NEW single-identity shape: `id` + top-level `component` discriminant.
  const id = node['id'];
  const discriminant = node['component'];
  if (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof discriminant === 'string' &&
    discriminant.length > 0
  ) {
    nodes.set(id, discriminant);
  }
}

/**
 * The structural shape of a resolved component-state schema: a Zod object whose
 * `.shape` we walk for sub-paths and whose `.safeParse` validates a value.
 */
type StateObjectSchema = ObjectSchema;

/**
 * Resolves the whole `*State` Zod schema for a component from its PascalCase
 * `component` discriminant, by finding the matching member of the INJECTED
 * `contracts` (whose discriminator is `component`) and reading its `state`
 * object.
 *
 * Returns `undefined` when no contract declares that discriminant OR when the
 * matching contract declares no `state` object — the "no `*State` schema"
 * case, for which the caller drops the op.
 *
 * The contract is INJECTED (never imported), so the core stays decoupled from
 * any concrete contract package (the design's `findComponentContract`).
 */
export function findComponentContract(
  discriminant: string,
  contracts: ContractsSchema
): StateObjectSchema | undefined {
  const member = contracts.options.find(
    (candidate) => candidate.shape.component.value === discriminant
  );
  if (!member) {
    return undefined;
  }
  const stateField = member.shape.state;
  if (!stateField) {
    return undefined;
  }
  const unwrapped = unwrapOptional(stateField);
  return isObjectSchema(unwrapped) ? unwrapped : undefined;
}

function unwrapOptional(schema: ParsableSchema): ParsableSchema {
  const candidate = schema as {unwrap?: () => ParsableSchema};
  return typeof candidate.unwrap === 'function' ? candidate.unwrap() : schema;
}

function isObjectSchema(schema: ParsableSchema): schema is StateObjectSchema {
  return isRecord((schema as {shape?: unknown}).shape);
}

/**
 * Derives the `State_Field_Schema` at a sub-path beneath `statePath(id)` by
 * walking the `*State` object's `.shape` one segment at a time (unwrapping
 * optionals between hops). Returns `undefined` when the sub-path does not
 * address a declared field (an unknown field, or a descent through a non-object
 * field), for which the caller drops the op.
 *
 * No merged whole state is ever reconstructed.
 */
function stateFieldSchema(
  stateSchema: StateObjectSchema,
  segments: readonly string[]
): ParsableSchema | undefined {
  let current: ParsableSchema = stateSchema;
  for (const segment of segments) {
    const unwrapped = unwrapOptional(current);
    if (!isObjectSchema(unwrapped)) {
      return undefined;
    }
    const next = unwrapped.shape[segment];
    if (!next) {
      return undefined;
    }
    current = next;
  }
  return current;
}

/**
 * Validates an inbound `updateDataModel` op in transit and returns the
 * FORWARD/DROP decision. Pure with respect to `(op, registry, contracts)`.
 *
 * - Resolves the op via `resolveOperation` against the ids present in the op's
 *   surface. A REJECTED op is dropped (`unresolved-path`).
 * - Looks up the resolved node's `component` discriminant in the registry and
 *   resolves its `*State` schema via {@link findComponentContract} from the
 *   INJECTED `contracts`. A missing identity or a component with no `*State`
 *   schema drops the op.
 * - Validates the value: whole-component op against the whole `*State` schema,
 *   partial op against the `State_Field_Schema` at the sub-path. A non-conforming
 *   value drops the op.
 *
 * The `contracts` are threaded in (never imported), so the validator stays
 * decoupled from any concrete contract package.
 */
export function validateInboundOp(
  op: InboundUpdateDataModelOp,
  registry: NodeIdentityRegistry,
  contracts: ContractsSchema
): InTransitDecision {
  const presentNodeIds = registry.get(op.surfaceId)?.keys() ?? [];
  const resolution = resolveOperation({path: op.path}, presentNodeIds);
  if (!resolution.resolved) {
    return {kind: 'drop', reason: 'unresolved-path'};
  }

  const discriminant = registry.get(op.surfaceId)?.get(resolution.nodeId);
  if (discriminant === undefined) {
    return {kind: 'drop', reason: 'unknown-node-identity'};
  }

  const stateSchema = findComponentContract(discriminant, contracts);
  if (!stateSchema) {
    return {kind: 'drop', reason: 'no-state-schema'};
  }

  const schema: ParsableSchema | undefined = resolution.wholeComponent
    ? stateSchema
    : stateFieldSchema(stateSchema, subPathSegments(op.path, resolution.nodeId));

  // A sub-path that addresses no declared field has no State_Field_Schema; drop
  // rather than validate against a reconstructed or merged whole state.
  if (!schema) {
    return {kind: 'drop', reason: 'invalid-value'};
  }

  const result = schema.safeParse(op.value);
  if (!result.success) {
    return {kind: 'drop', reason: 'invalid-value'};
  }
  return {kind: 'forward', path: op.path, value: result.data};
}

/**
 * Splits the JSON Pointer segments of a partial op that lie BENEATH
 * `statePath(nodeId)`. For `path = statePath(id) + "/" + a + "/" + b` this
 * yields `[a, b]`. Segments are RFC 6901-unescaped (`~1` → `/`, `~0` → `~`).
 */
function subPathSegments(path: string, nodeId: string): string[] {
  const root = statePath(nodeId);
  const remainder = path.slice(root.length); // begins with "/"
  return remainder
    .split('/')
    .filter((segment) => segment.length > 0)
    .map(jsonPointerUnescape);
}

function jsonPointerUnescape(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * Reads the `updateDataModel` ops carried by a single A2-UI `messages[]` list.
 * Each op message has the shape `{ updateDataModel: { surfaceId, path, value } }`.
 * Messages that are not well-formed `updateDataModel` ops are skipped.
 */
export function readUpdateDataModelOps(messages: readonly unknown[]): InboundUpdateDataModelOp[] {
  const ops: InboundUpdateDataModelOp[] = [];
  for (const message of messages) {
    if (!isRecord(message)) {
      continue;
    }
    const op = message['updateDataModel'];
    if (!isRecord(op)) {
      continue;
    }
    const surfaceId = op['surfaceId'];
    const path = op['path'];
    if (typeof surfaceId !== 'string' || typeof path !== 'string') {
      continue;
    }
    ops.push({surfaceId, path, value: op['value']});
  }
  return ops;
}
