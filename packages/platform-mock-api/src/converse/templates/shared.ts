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

// Builds the `{ path }` bindings for a stateful node's state-bound props: each state field name maps
// to a Data_Binding object pointing at its `/state/<id>/<field>` sub-path. In the flat A2-UI node
// model these bindings are spread directly onto the node top level (there is no `props` wrapper).
// The renderer resolves them against the A2-UI data model, so identity is never needed to hydrate
// state.
function bindStateFields(id: string, fields: readonly string[]): Record<string, DataBinding> {
  const bindings: Record<string, DataBinding> = {};
  for (const field of fields) {
    bindings[field] = {path: stateFieldPath(id, field)};
  }
  return bindings;
}

// A2-UI component node on the composition plane, following the A2-UI v1.0 FLAT adjacency-list shape.
// Each node carries a SINGLE identity (`id` + PascalCase `component` discriminant) and its own
// properties directly at the top level: presentation values, Data_Binding objects (`{ path }`) for
// state-bound props, and static composition links (named ComponentId slots such as
// `sidebarChild`/`mainChild`, and homogeneous `children` ChildList arrays). There is no `props`
// wrapper, and a node NEVER carries the removed dual-identity keys `componentId`/`componentType`.
interface A2uiComponentNode {
  id: string;
  component: string;
  [key: string]: unknown;
}

// Reads a node's composition children from its top-level properties, whether declared as a
// `children` array (homogeneous lists: LayoutStack, FacetManager) or named ComponentId slots
// (heterogeneous containers: CommerceSearch → sidebarChild/mainChild). Used only by surface
// validation.
function childRefsOf(node: A2uiComponentNode): string[] {
  const refs: string[] = [];
  const sidebarChild = node['sidebarChild'];
  if (typeof sidebarChild === 'string') {
    refs.push(sidebarChild);
  }
  const mainChild = node['mainChild'];
  if (typeof mainChild === 'string') {
    refs.push(mainChild);
  }
  const children = node['children'];
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === 'string') {
        refs.push(child);
      }
    }
  }
  return refs;
}

// The canonical A2-UI v1.0 root node id. `createSurface` implicitly instantiates the reserved
// `Surface` container with `child: "root"`, so exactly one emitted node must carry `id: "root"`;
// it mounts as the surface's root. The envelope therefore carries NO `rootId` (that field is not
// part of the A2-UI v1.0 createSurface contract).
const RENDERER_ROOT_ID = 'root';

interface BuildValidatedSurfaceOptions {
  // Prefix used in thrown error messages so a failure names the offending template.
  templateName: string;
  surfaceId: string;
  nodes: A2uiComponentNode[];
}

// Validates that a single canonical `root` node and every referenced child resolve to an emitted
// node, then assembles the A2-UI v1.0 createSurface. A missing root or child throws an error naming
// the offending node so no partial tree is ever emitted. The envelope follows the v1.0 contract:
// { surfaceId, catalogId, components } — no `rootId` (the root is the node with `id: "root"`), and
// no non-standard surface properties.
function buildValidatedSurface({
  templateName,
  surfaceId,
  nodes,
}: BuildValidatedSurfaceOptions): Record<string, unknown> {
  const ids = new Set(nodes.map((node) => node.id));

  if (!ids.has(RENDERER_ROOT_ID)) {
    throw new Error(
      `${templateName}: createSurface.components[] must contain exactly one node with id "${RENDERER_ROOT_ID}" (the A2-UI canonical surface root); none was found.`
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
    catalogId: CATALOG_ID,
    components: nodes,
  };
}

export {
  CATALOG_ID,
  RENDERER_ROOT_ID,
  statePath,
  bindStateFields,
  buildConversationResponse,
  buildRoutedResponse,
  buildValidatedSurface,
};
export type {A2uiComponentNode};
