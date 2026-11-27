/**
 * Node -> data-model path mapping for the inline Component_State transport,
 * owned by the runtime (moved from `@coveo/thermidor-schema` so the core stays
 * decoupled from any contract package). Defines the deterministic, one-to-one,
 * stable mapping from a node `id` to the JSON Pointer root of its state, plus
 * the RFC 6901 escaping used to build it.
 */

/**
 * The server-owned root prefix under which all Component_State lives in the
 * A2-UI data model. This is our own organization convention (A2-UI does not
 * mandate how the data model is organized); only the producer writes here.
 */
export const STATE_NAMESPACE = '/state';

/**
 * RFC 6901 escaping for one path segment: `~` -> `~0`, `/` -> `~1` (`~` first
 * so an existing `~1` is not double-escaped). Node ids match
 * `^[a-z][a-z0-9-]*$`, so this is effectively the identity, applied for
 * correctness.
 */
export function jsonPointerEscape(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Root JSON Pointer of a node's Component_State:
 * `STATE_NAMESPACE + "/" + jsonPointerEscape(id)`. One-to-one and stable.
 */
export function statePath(id: string): string {
  return `${STATE_NAMESPACE}/${jsonPointerEscape(id)}`;
}
