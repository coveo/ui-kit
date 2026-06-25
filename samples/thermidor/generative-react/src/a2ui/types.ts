/**
 * Types for parsing A2UI surface operations from ACTIVITY_SNAPSHOT events.
 */

export interface A2UISurfaceData {
  operations: A2UIOperation[];
  replace?: boolean;
}

export type A2UIOperation =
  | {beginRendering: BeginRenderingOp}
  | {surfaceUpdate: SurfaceUpdateOp}
  | {dataModelUpdate: DataModelUpdateOp};

export interface BeginRenderingOp {
  surfaceId: string;
  root: string;
  catalogId?: string;
}

export interface SurfaceUpdateOp {
  surfaceId: string;
  components: ComponentEntry[];
}

export interface ComponentEntry {
  id: string;
  component: Record<string, unknown>;
}

export interface DataModelUpdateOp {
  surfaceId: string;
  contents: DataModelContent[];
}

export interface DataModelContent {
  key: string;
  valueMap?: ValueMapEntry[];
  valueString?: string;
  valueNumber?: number;
}

export interface ValueMapEntry {
  valueMap?: ValueMapField[];
  key?: string;
  valueString?: string;
  valueNumber?: number;
}

export interface ValueMapField {
  key: string;
  valueString?: string;
  valueNumber?: number;
}

/**
 * Parsed surface ready for rendering.
 */
export interface ParsedSurface {
  surfaceId: string;
  rootId: string;
  componentType: string;
  componentProps: Record<string, unknown>;
  components: ComponentEntry[];
  data: Record<string, unknown>;
}

/**
 * Parse an A2UI surface snapshot into a list of renderable surfaces.
 */
export function parseSurfaceSnapshot(
  raw: Record<string, unknown>
): ParsedSurface[] {
  const snapshot = raw as unknown as A2UISurfaceData;
  if (!snapshot.operations || !Array.isArray(snapshot.operations)) {
    return [];
  }

  const surfaces = new Map<
    string,
    {
      rootId: string;
      componentType: string;
      componentProps: Record<string, unknown>;
      components: ComponentEntry[];
      data: Record<string, unknown>;
    }
  >();

  for (const op of snapshot.operations) {
    if ('beginRendering' in op) {
      const {surfaceId, root} = op.beginRendering;
      if (!surfaces.has(surfaceId)) {
        surfaces.set(surfaceId, {
          rootId: root,
          componentType: '',
          componentProps: {},
          components: [],
          data: {},
        });
      }
    }

    if ('surfaceUpdate' in op) {
      const {surfaceId, components} = op.surfaceUpdate;
      const entry = surfaces.get(surfaceId);
      if (entry) {
        entry.components = components;
        if (components.length > 0) {
          const rootComponent = components[0].component;
          const [type, props] = Object.entries(rootComponent)[0] ?? [
            'Unknown',
            {},
          ];
          entry.componentType = type;
          entry.componentProps = props as Record<string, unknown>;
        }
      }
    }

    if ('dataModelUpdate' in op) {
      const {surfaceId, contents} = op.dataModelUpdate;
      const entry = surfaces.get(surfaceId);
      if (entry) {
        for (const content of contents) {
          entry.data[content.key] = extractDataValue(content);
        }
      }
    }
  }

  return Array.from(surfaces.entries()).map(([surfaceId, entry]) => ({
    surfaceId,
    rootId: entry.rootId,
    componentType: entry.componentType,
    componentProps: entry.componentProps,
    components: entry.components,
    data: entry.data,
  }));
}

function extractDataValue(content: DataModelContent): unknown {
  if (content.valueString !== undefined) return content.valueString;
  if (content.valueNumber !== undefined) return content.valueNumber;
  if (content.valueMap) {
    return content.valueMap.map((entry) => {
      if (entry.valueMap) {
        const obj: Record<string, unknown> = {};
        for (const field of entry.valueMap) {
          obj[field.key] = field.valueString ?? field.valueNumber;
        }
        return obj;
      }
      return entry;
    });
  }
  return null;
}
