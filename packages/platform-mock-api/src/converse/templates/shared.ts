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

// A2-UI component node on the composition plane. `children` (when present) declares the ids of
// the nodes this node composes; composition lives here, never in AG-UI state. `props` may carry
// presentation node props beyond the correlation fields (e.g. a layout-stack's `direction`).
interface A2uiComponentNode {
  id: string;
  component: string;
  props: {componentId: string; componentType: string} & Record<string, unknown>;
  children?: string[];
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
    for (const childId of node.children ?? []) {
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

export {CATALOG_ID, buildConversationResponse, buildRoutedResponse, buildValidatedSurface};
export type {A2uiComponentNode};
