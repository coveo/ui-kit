import {
  RunFinished,
  RunStarted,
  StateSnapshot,
  TurnComplete,
  TurnStarted,
  type ConverseEvent,
} from '../events.js';

interface BuildConversationResponseOptions {
  runId: string;
  middleEvents: ConverseEvent[];
  threadId?: string;
  includeInitialStateSnapshot?: boolean;
  includeFinalStateSnapshot?: boolean;
}

const buildConversationResponse = ({
  runId,
  middleEvents,
  threadId,
  includeInitialStateSnapshot = true,
  includeFinalStateSnapshot = true,
}: BuildConversationResponseOptions): ConverseEvent[] => [
  TurnStarted(),
  RunStarted({runId, threadId}),
  ...(includeInitialStateSnapshot ? [StateSnapshot()] : []),
  ...middleEvents,
  ...(includeFinalStateSnapshot ? [StateSnapshot()] : []),
  RunFinished({runId, threadId}),
  TurnComplete(),
];

const buildRoutedResponse = ({routedEvent}: {routedEvent: ConverseEvent}): ConverseEvent[] => [
  TurnStarted(),
  routedEvent,
  TurnComplete(),
];

const CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

// The server-owned root prefix under which all Component_State lives in the A2-UI data model.
// Mirrors @coveo/thermidor-schema's STATE_NAMESPACE. This package intentionally has NO dependency
// on the schema package (adding one would mutate the lockfile/catalog), so the small path helper
// is duplicated locally rather than imported.
const STATE_NAMESPACE = '/state';

// RFC 6901 JSON Pointer reference-token escaping for a single path segment: `~` becomes `~0` and
// `/` becomes `~1` (the `~` replacement runs first so an already-escaped `~1` is not double
// escaped). The mock's node ids are simple slugs with neither character, so this is effectively
// the identity, but it is applied for fidelity with the schema convention.
function jsonPointerEscape(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

// Maps a component node `id` to the root JSON Pointer path of its Component_State in the A2-UI
// data model: `statePath(id) = STATE_NAMESPACE + "/" + jsonPointerEscape(id)`. One-to-one and
// stable across emissions.
function statePath(id: string): string {
  return `${STATE_NAMESPACE}/${jsonPointerEscape(id)}`;
}

// The sub-path beneath `statePath(id)` addressing a single Component_State field.
function stateFieldPath(id: string, field: string): string {
  return `${statePath(id)}/${jsonPointerEscape(field)}`;
}

// An A2-UI Data_Binding object: `{ path }` referencing a value in the A2-UI data model.
interface DataBinding {
  path: string;
}

// Builds the `{ path }` bindings for a stateful node's props: each state field name maps to a
// Data_Binding object pointing at its `/state/<id>/<field>` sub-path. The renderer resolves these
// bindings against the A2-UI data model, so identity is never needed to hydrate state.
function bindStateFields(id: string, fields: readonly string[]): Record<string, DataBinding> {
  const props: Record<string, DataBinding> = {};
  for (const field of fields) {
    props[field] = {path: stateFieldPath(id, field)};
  }
  return props;
}

// A2-UI component node on the composition plane. Each node carries a SINGLE identity: a top-level
// `id` and `component` discriminant. `props` (optional) carries ONLY presentation values,
// Data_Binding objects (`{ path }`) for state-bound props, and static container-composition
// child-ref fields (named slots such as `sidebarChild`/`mainChild`, and homogeneous `children`
// lists); it NEVER carries the identity keys `id`/`component`/`componentId`/`componentType`.
interface A2uiComponentNode {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

// Reads a node's composition children regardless of whether they are declared as a `children`
// array (homogeneous lists: LayoutStack, FacetManager) or named child-ref slots (heterogeneous
// containers: CommerceSearch → sidebarChild/mainChild). Used only by surface validation.
function childRefsOf(node: A2uiComponentNode): string[] {
  const props = node.props ?? {};
  const refs: string[] = [];
  const namedSlots = props['sidebarChild'];
  if (typeof namedSlots === 'string') {
    refs.push(namedSlots);
  }
  const mainChild = props['mainChild'];
  if (typeof mainChild === 'string') {
    refs.push(mainChild);
  }
  const children = props['children'];
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === 'string') {
        refs.push(child);
      }
    }
  }
  return refs;
}

interface BuildValidatedSurfaceOptions {
  // Prefix used in thrown error messages so a failure names the offending template.
  templateName: string;
  surfaceId: string;
  rootId: string;
  nodes: A2uiComponentNode[];
  // Extra surface-level properties merged into the createSurface (e.g. `surfaceProperties`).
  extra?: Record<string, unknown>;
}

// Validates that the declared root and every referenced child resolve to an emitted node, then
// assembles the createSurface. A missing root or child throws an error naming the missing node
// so no partial tree is ever emitted.
function buildValidatedSurface({
  templateName,
  surfaceId,
  rootId,
  nodes,
  extra,
}: BuildValidatedSurfaceOptions): Record<string, unknown> {
  const ids = new Set(nodes.map((node) => node.id));

  if (!ids.has(rootId)) {
    throw new Error(
      `${templateName}: declared root node "${rootId}" is absent from createSurface.components[].`
    );
  }

  for (const node of nodes) {
    for (const childId of childRefsOf(node)) {
      if (!ids.has(childId)) {
        throw new Error(
          `${templateName}: node "${node.id}" references child "${childId}" which is absent from createSurface.components[].`
        );
      }
    }
  }

  return {
    surfaceId,
    rootId,
    catalogId: CATALOG_ID,
    ...(extra ?? {}),
    components: nodes,
  };
}

export {
  CATALOG_ID,
  STATE_NAMESPACE,
  jsonPointerEscape,
  statePath,
  stateFieldPath,
  bindStateFields,
  buildConversationResponse,
  buildRoutedResponse,
  buildValidatedSurface,
};
export type {A2uiComponentNode, DataBinding};
