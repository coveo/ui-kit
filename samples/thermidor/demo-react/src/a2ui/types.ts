interface ComponentDefinition {
  id: string;
  component: string;
  componentProps?: Record<string, unknown>;
}
interface CreateSurfaceOp {
  surfaceId: string;
  catalogId?: string;
  surfaceProperties?: Record<string, unknown>;
  sendDataModel?: boolean;
  components?: ComponentDefinition[];
  dataModel?: Record<string, unknown>;
}
interface UpdateDataModelOp {
  surfaceId: string;
  path?: string;
  value: unknown;
}
interface UpdateComponentsOp {
  surfaceId: string;
  components?: ComponentDefinition[];
}
type A2UIOperation =
  | {createSurface: CreateSurfaceOp}
  | {updateDataModel: UpdateDataModelOp}
  | {updateComponents: UpdateComponentsOp}
  | {actionResponse: unknown};
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
type SurfaceState = Omit<ParsedSurface, 'surfaceId'>;
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isComponentDefinition(value: unknown): value is ComponentDefinition {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.component !== 'string') {
    return false;
  }
  return value.componentProps === undefined || isRecord(value.componentProps);
}
function isComponentDefinitions(value: unknown): value is ComponentDefinition[] {
  return Array.isArray(value) && value.every(isComponentDefinition);
}
function normalizeComponent(
  component: ComponentDefinition | undefined
): Omit<SurfaceState, 'data'> {
  if (!component) {
    return {
      rootId: 'root',
      componentType: '',
      componentProps: {},
    };
  }
  return {
    rootId: component.id,
    componentType: component.component,
    componentProps: component.componentProps ?? {},
  };
}
function getCreateSurfaceOperation(value: unknown): CreateSurfaceOp | undefined {
  if (!isRecord(value) || !isRecord(value.createSurface)) {
    return undefined;
  }
  const operation = value.createSurface;
  if (typeof operation.surfaceId !== 'string') {
    return undefined;
  }
  if (operation.components !== undefined && !isComponentDefinitions(operation.components)) {
    return undefined;
  }
  if (
    operation.dataModel !== undefined &&
    operation.dataModel !== null &&
    !isRecord(operation.dataModel)
  ) {
    return undefined;
  }
  return operation as unknown as CreateSurfaceOp;
}
function getUpdateDataModelOperation(value: unknown): UpdateDataModelOp | undefined {
  if (!isRecord(value) || !isRecord(value.updateDataModel)) {
    return undefined;
  }
  const operation = value.updateDataModel;
  if (
    typeof operation.surfaceId !== 'string' ||
    !Object.prototype.hasOwnProperty.call(operation, 'value') ||
    (operation.path !== undefined && typeof operation.path !== 'string')
  ) {
    return undefined;
  }
  return operation as unknown as UpdateDataModelOp;
}
function getUpdateComponentsOperation(value: unknown): UpdateComponentsOp | undefined {
  if (!isRecord(value) || !isRecord(value.updateComponents)) {
    return undefined;
  }
  const operation = value.updateComponents;
  if (
    typeof operation.surfaceId !== 'string' ||
    (operation.components !== undefined && !isComponentDefinitions(operation.components))
  ) {
    return undefined;
  }
  return operation as unknown as UpdateComponentsOp;
}
/**
 * Parse an A2UI surface snapshot into a list of renderable surfaces.
 */
export function parseSurfaceSnapshot(raw: Record<string, unknown>): ParsedSurface[] {
  const snapshot = isRecord(raw) ? (raw as unknown as A2UISurfaceData) : undefined;
  if (!snapshot || !Array.isArray(snapshot.operations) || snapshot.operations.length === 0) {
    return [];
  }
  const surfaces = new Map<string, SurfaceState>();
  for (const operation of snapshot.operations) {
    const createSurface = getCreateSurfaceOperation(operation);
    if (createSurface) {
      surfaces.set(createSurface.surfaceId, {
        ...normalizeComponent(createSurface.components?.[0]),
        data: createSurface.dataModel ?? {},
      });
      continue;
    }
    const updateDataModel = getUpdateDataModelOperation(operation);
    if (updateDataModel) {
      const entry = surfaces.get(updateDataModel.surfaceId);
      if (!entry) {
        continue;
      }
      if (updateDataModel.path === '/' || !updateDataModel.path) {
        if (
          updateDataModel.value !== null &&
          updateDataModel.value !== undefined &&
          !isRecord(updateDataModel.value)
        ) {
          continue;
        }
        entry.data = isRecord(updateDataModel.value) ? updateDataModel.value : {};
      } else {
        const key = updateDataModel.path.startsWith('/')
          ? updateDataModel.path.slice(1)
          : updateDataModel.path;
        entry.data[key] = updateDataModel.value;
      }
      continue;
    }
    const updateComponents = getUpdateComponentsOperation(operation);
    if (updateComponents) {
      const entry = surfaces.get(updateComponents.surfaceId);
      if (entry && updateComponents.components?.[0]) {
        Object.assign(entry, normalizeComponent(updateComponents.components[0]));
      }
      continue;
    }
    if (isRecord(operation) && Object.prototype.hasOwnProperty.call(operation, 'actionResponse')) {
      continue;
    }
  }
  return Array.from(surfaces.entries()).map(([surfaceId, entry]) => ({
    surfaceId,
    ...entry,
  }));
}
