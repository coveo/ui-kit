import type {A2uiV09Message, Turn} from '@coveo/thermidor';

/**
 * The surface-scope A2-UI v1.0 extension that carries a surface's layout hint
 * (`createSurface.metadata.extensions.coveo_layout.slot`).
 */
export const LAYOUT_EXTENSION = 'coveo_layout';

/** The layout slots this page draws. A surface with any other slot is not drawn. */
export const SLOTS = {
  headerSuggestions: 'header.suggestions',
  headerCart: 'header.cart',
  main: 'main',
} as const;

/** One live surface and where the server asked for it to be drawn. */
export interface PlacedSurface {
  surfaceId: string;
  slot: string | undefined;
  /** The `component` of the surface's `root` node. */
  rootComponent: string | undefined;
  /** The index of the turn that created the surface. */
  turnIndex: number;
}

export interface SurfaceLayout {
  /** Every turn's renderer messages, in order, for the one renderer that hosts every surface. */
  messages: A2uiV09Message[];
  /** The surfaces still alive, in creation order. */
  surfaces: readonly PlacedSurface[];
}

const SURFACE_OPERATIONS = [
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface SurfaceHints {
  slot: string | undefined;
  rootComponent: string | undefined;
}

/**
 * Reads each surface's hints from the turn's raw A2-UI v1.0 messages. The v0.9 projection
 * `@coveo/thermidor` hands to the renderer drops `createSurface.metadata`, so the slot is read
 * from the activities it was derived from.
 */
function readSurfaceHints(turn: Turn): Map<string, SurfaceHints> {
  const hints = new Map<string, SurfaceHints>();
  for (const activity of turn.response.activities) {
    const messages = activity.payload['messages'];
    if (activity.kind !== 'a2ui-surface' || !Array.isArray(messages)) {
      continue;
    }
    for (const message of messages) {
      const createSurface = isRecord(message) ? message['createSurface'] : undefined;
      if (!isRecord(createSurface) || typeof createSurface['surfaceId'] !== 'string') {
        continue;
      }
      const metadata = isRecord(createSurface['metadata']) ? createSurface['metadata'] : {};
      const extensions = isRecord(metadata['extensions']) ? metadata['extensions'] : {};
      const layout = isRecord(extensions[LAYOUT_EXTENSION]) ? extensions[LAYOUT_EXTENSION] : {};
      const components = Array.isArray(createSurface['components'])
        ? createSurface['components']
        : [];
      const root = components.find((node: unknown) => isRecord(node) && node['id'] === 'root');
      hints.set(createSurface['surfaceId'], {
        slot: typeof layout['slot'] === 'string' ? layout['slot'] : undefined,
        rootComponent:
          isRecord(root) && typeof root['component'] === 'string' ? root['component'] : undefined,
      });
    }
  }
  return hints;
}

/**
 * Builds the one renderer stream for the whole session, and the live surfaces with their slots.
 *
 * In A2-UI v1.0 a surface id is unique for the renderer's lifetime and a surface lives until a
 * `deleteSurface` removes it, so a surface created by one turn can be updated or deleted by any
 * later turn. An operation on a surface the stream does not know, such as the deletion of a
 * surface whose turn was cancelled before it arrived, is dropped.
 */
export function buildSurfaceLayout(turns: readonly Turn[]): SurfaceLayout {
  const messages: A2uiV09Message[] = [];
  const live = new Map<string, PlacedSurface>();

  turns.forEach((turn, turnIndex) => {
    const hints = readSurfaceHints(turn);
    for (const message of turn.response.a2uiMessages) {
      const operation = SURFACE_OPERATIONS.find((name) => isRecord(message[name]));
      const body = operation ? (message[operation] as Record<string, unknown>) : undefined;
      const surfaceId = typeof body?.['surfaceId'] === 'string' ? body['surfaceId'] : undefined;
      if (!operation || surfaceId === undefined) {
        continue;
      }

      if (operation === 'createSurface') {
        if (live.has(surfaceId)) {
          continue;
        }
        const surfaceHints = hints.get(surfaceId);
        live.set(surfaceId, {
          surfaceId,
          slot: surfaceHints?.slot,
          rootComponent: surfaceHints?.rootComponent,
          turnIndex,
        });
      } else if (!live.has(surfaceId)) {
        continue;
      }

      messages.push(message);
      if (operation === 'deleteSurface') {
        live.delete(surfaceId);
      }
    }
  });

  return {messages, surfaces: [...live.values()]};
}

/** The live surfaces the server placed in `slot`, optionally only those created since a turn. */
export function surfacesInSlot(
  layout: SurfaceLayout,
  slot: string,
  sinceTurnIndex = 0
): readonly PlacedSurface[] {
  return layout.surfaces.filter(
    (surface) => surface.slot === slot && surface.turnIndex >= sinceTurnIndex
  );
}

/** The live surface whose root is `component`, used to address an action to it. */
export function findSurfaceByRoot(
  layout: SurfaceLayout,
  component: string
): PlacedSurface | undefined {
  return layout.surfaces.find((surface) => surface.rootComponent === component);
}
