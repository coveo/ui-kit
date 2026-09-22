/**
 * Node -> data-model path mapping for Thermidor inline Component_State.
 *
 * These are hand-written inline-TRANSPORT conventions OWNED BY THE RUNTIME (not
 * component-contract data). They were moved out of `@coveo/thermidor-schema`
 * and into `@coveo/thermidor` so the runtime stays decoupled from any concrete
 * contract package: the path convention is a property of how the core routes
 * inbound `updateDataModel` ops, and lives beside the code that applies it
 * rather than being duplicated in every schema package.
 *
 * They define the deterministic, one-to-one, stable mapping from a component
 * node `id` to the JSON Pointer path in the A2-UI data model that is the ROOT
 * of that component's Component_State, plus the RFC 6901 escaping used to build
 * it.
 */

/**
 * The server-owned root prefix under which all Component_State lives in the
 * A2-UI data model. This is our own organization convention (A2-UI does not
 * mandate how the data model is organized); only the producer writes here.
 */
export const STATE_NAMESPACE = '/state';

/**
 * Apply RFC 6901 JSON Pointer reference-token escaping to a single path
 * segment: `~` becomes `~0` and `/` becomes `~1`. The `~` replacement runs
 * first so an already-escaped `~1` is not double-escaped.
 *
 * Node ids are constrained to `^[a-z][a-z0-9-]*$`, which contains neither `/`
 * nor `~`, so in practice this is the identity. It is applied anyway for
 * correctness and future-proofing.
 */
export function jsonPointerEscape(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Map a component node `id` to the root JSON Pointer path of its
 * Component_State in the A2-UI data model.
 *
 * `statePath(id) = STATE_NAMESPACE + "/" + jsonPointerEscape(id)`.
 *
 * The mapping is one-to-one (distinct ids produce distinct paths) and stable
 * (the same id always resolves to the identical path across emissions).
 */
export function statePath(id: string): string {
  return `${STATE_NAMESPACE}/${jsonPointerEscape(id)}`;
}
