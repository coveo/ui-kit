/**
 * Types for parsing A2UI surface operations from ACTIVITY_SNAPSHOT events.
 *
 * Supports both the legacy operation format (beginRendering/surfaceUpdate/dataModelUpdate)
 * and the unified endpoint format (createSurface/updateDataModel/updateComponents).
 */

// ─── Unified endpoint format (v0 contract) ─────────────────────────────────

interface CreateSurfaceOp {
  surfaceId: string;
  catalogId?: string;
  surfaceProperties?: Record<string, unknown>;
  sendDataModel?: boolean;
  components?: Array<{id: string; component: string}>;
  dataModel?: Record<string, unknown>;
}

interface UpdateDataModelOp {
  surfaceId: string;
  path: string;
  value: unknown;
}

// ─── Legacy format ──────────────────────────────────────────────────────────

interface BeginRenderingOp {
  surfaceId: string;
  root: string;
  catalogId?: string;
}

interface SurfaceUpdateOp {
  surfaceId: string;
  components: Array<{id: string; component: Record<string, unknown>}>;
}

interface DataModelUpdateOp {
  surfaceId: string;
  contents: DataModelContent[];
}

interface DataModelContent {
  key: string;
  valueMap?: ValueMapEntry[];
  valueString?: string;
  valueNumber?: number;
}

interface ValueMapEntry {
  valueMap?: ValueMapField[];
  key?: string;
  valueString?: string;
  valueNumber?: number;
}

interface ValueMapField {
  key: string;
  valueString?: string;
  valueNumber?: number;
}

// ─── Combined operation type ────────────────────────────────────────────────

type A2UIOperation =
  | {createSurface: CreateSurfaceOp}
  | {updateDataModel: UpdateDataModelOp}
  | {updateComponents: unknown}
  | {actionResponse: unknown}
  | {beginRendering: BeginRenderingOp}
  | {surfaceUpdate: SurfaceUpdateOp}
  | {dataModelUpdate: DataModelUpdateOp};

interface A2UISurfaceData {
  operations: A2UIOperation[];
  replace?: boolean;
}

/**
 * Parsed surface ready for rendering.
 */
export interface ParsedSurface {
  surfaceId: string;
  rootId: string;
  componentType: string;
  componentProps: Record<string, unknown>;
  data: Record<string, unknown>;
}

/**
 * Parse an A2UI surface snapshot into a list of renderable surfaces.
 * Handles both the unified endpoint format (createSurface/updateDataModel)
 * and the legacy format (beginRendering/surfaceUpdate/dataModelUpdate).
 */
export function parseSurfaceSnapshot(raw: Record<string, unknown>): ParsedSurface[] {
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
      data: Record<string, unknown>;
    }
  >();

  for (const op of snapshot.operations) {
    // ─── Unified endpoint: createSurface ──────────────────────────────
    if ('createSurface' in op) {
      const {surfaceId, components, dataModel} = op.createSurface;
      const componentType = components?.[0]?.component ?? '';
      surfaces.set(surfaceId, {
        rootId: components?.[0]?.id ?? 'root',
        componentType,
        componentProps: {},
        data: dataModel ?? {},
      });
      continue;
    }

    // ─── Unified endpoint: updateDataModel ────────────────────────────
    if ('updateDataModel' in op) {
      const {surfaceId, path, value} = op.updateDataModel;
      const entry = surfaces.get(surfaceId);
      if (entry) {
        if (path === '/' || !path) {
          // Full model replacement
          entry.data = (value as Record<string, unknown>) ?? {};
        } else {
          // Path-based update (e.g., "/products" → key "products")
          const key = path.startsWith('/') ? path.slice(1) : path;
          entry.data[key] = value;
        }
      }
      continue;
    }

    // ─── Legacy: beginRendering ───────────────────────────────────────
    if ('beginRendering' in op) {
      const {surfaceId, root} = op.beginRendering;
      if (!surfaces.has(surfaceId)) {
        surfaces.set(surfaceId, {
          rootId: root,
          componentType: '',
          componentProps: {},
          data: {},
        });
      }
      continue;
    }

    // ─── Legacy: surfaceUpdate ────────────────────────────────────────
    if ('surfaceUpdate' in op) {
      const {surfaceId, components} = op.surfaceUpdate;
      const entry = surfaces.get(surfaceId);
      if (entry && components.length > 0) {
        const rootComponent = components[0].component;
        const [type, props] = Object.entries(rootComponent)[0] ?? ['Unknown', {}];
        entry.componentType = type;
        entry.componentProps = props as Record<string, unknown>;
      }
      continue;
    }

    // ─── Legacy: dataModelUpdate ──────────────────────────────────────
    if ('dataModelUpdate' in op) {
      const {surfaceId, contents} = op.dataModelUpdate;
      const entry = surfaces.get(surfaceId);
      if (entry) {
        for (const content of contents) {
          entry.data[content.key] = extractLegacyDataValue(content);
        }
      }
      continue;
    }
  }

  return Array.from(surfaces.entries()).map(([surfaceId, entry]) => ({
    surfaceId,
    rootId: entry.rootId,
    componentType: entry.componentType,
    componentProps: entry.componentProps,
    data: entry.data,
  }));
}

function extractLegacyDataValue(content: DataModelContent): unknown {
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
