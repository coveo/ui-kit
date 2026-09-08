interface ComponentDefinition {
  id: string;
  component: string;
  componentProps?: Record<string, unknown>;
  props?: Record<string, unknown>;
}

interface CreateSurfaceOp {
  surfaceId: string;
  catalogId?: string;
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

interface DeleteSurfaceOp {
  surfaceId: string;
}

type A2UIOperation =
  | {createSurface: CreateSurfaceOp}
  | {updateDataModel: UpdateDataModelOp}
  | {updateComponents: UpdateComponentsOp}
  | {deleteSurface: DeleteSurfaceOp}
  | {actionResponse: unknown};

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
  if (value.componentProps !== undefined && !isRecord(value.componentProps)) {
    return false;
  }
  if (value.props !== undefined && !isRecord(value.props)) {
    return false;
  }
  return true;
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
    componentProps: component.props ?? component.componentProps ?? {},
  };
}

function getOperation(message: unknown): A2UIOperation | undefined {
  if (!isRecord(message) || message.version !== 'v1.0') {
    return undefined;
  }

  const operationKeys = [
    'createSurface',
    'updateDataModel',
    'updateComponents',
    'deleteSurface',
    'actionResponse',
  ].filter((key) => Object.prototype.hasOwnProperty.call(message, key));
  if (operationKeys.length !== 1) {
    return undefined;
  }

  switch (operationKeys[0]) {
    case 'createSurface':
      return getCreateSurfaceOperation(message);
    case 'updateDataModel':
      return getUpdateDataModelOperation(message);
    case 'updateComponents':
      return getUpdateComponentsOperation(message);
    case 'deleteSurface':
      return getDeleteSurfaceOperation(message);
    case 'actionResponse':
      return {actionResponse: message.actionResponse};
    default:
      return undefined;
  }
}

function getCreateSurfaceOperation(value: Record<string, unknown>): A2UIOperation | undefined {
  if (!isRecord(value.createSurface)) {
    return undefined;
  }
  const operation = value.createSurface;
  if (
    typeof operation.surfaceId !== 'string' ||
    (operation.catalogId !== undefined && typeof operation.catalogId !== 'string') ||
    (operation.sendDataModel !== undefined && typeof operation.sendDataModel !== 'boolean') ||
    (operation.components !== undefined && !isComponentDefinitions(operation.components)) ||
    (operation.dataModel !== undefined && !isRecord(operation.dataModel))
  ) {
    return undefined;
  }
  return {createSurface: operation as unknown as CreateSurfaceOp};
}

function getUpdateDataModelOperation(value: Record<string, unknown>): A2UIOperation | undefined {
  if (!isRecord(value.updateDataModel)) {
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
  return {updateDataModel: operation as unknown as UpdateDataModelOp};
}

function getUpdateComponentsOperation(value: Record<string, unknown>): A2UIOperation | undefined {
  if (!isRecord(value.updateComponents)) {
    return undefined;
  }
  const operation = value.updateComponents;
  if (
    typeof operation.surfaceId !== 'string' ||
    (operation.components !== undefined && !isComponentDefinitions(operation.components))
  ) {
    return undefined;
  }
  return {updateComponents: operation as unknown as UpdateComponentsOp};
}

function getDeleteSurfaceOperation(value: Record<string, unknown>): A2UIOperation | undefined {
  if (!isRecord(value.deleteSurface) || typeof value.deleteSurface.surfaceId !== 'string') {
    return undefined;
  }
  return {deleteSurface: value.deleteSurface as unknown as DeleteSurfaceOp};
}

/**
 * Parse an A2UI surface snapshot into a list of renderable surfaces.
 */
export function parseSurfaceSnapshot(raw: Record<string, unknown>): ParsedSurface[] {
  return parseSurfaceSnapshots([raw]);
}

export function parseSurfaceSnapshots(
  rawSnapshots: ReadonlyArray<Record<string, unknown>>
): ParsedSurface[] {
  const surfaces = new Map<string, SurfaceState>();

  for (const snapshot of rawSnapshots) {
    if (!Array.isArray(snapshot.messages)) {
      continue;
    }
    for (const message of snapshot.messages) {
      const operation = getOperation(message);
      if (!operation) {
        continue;
      }
      applyOperation(surfaces, operation);
    }
  }

  return Array.from(surfaces.entries()).map(([surfaceId, entry]) => ({surfaceId, ...entry}));
}

function applyOperation(surfaces: Map<string, SurfaceState>, operation: A2UIOperation): void {
  if ('createSurface' in operation) {
    const createSurface = operation.createSurface;
    surfaces.set(createSurface.surfaceId, {
      ...normalizeComponent(createSurface.components?.[0]),
      data: createSurface.dataModel ?? {},
    });
    return;
  }

  if ('updateDataModel' in operation) {
    const updateDataModel = operation.updateDataModel;
    const entry = surfaces.get(updateDataModel.surfaceId);
    if (!entry) {
      return;
    }
    if (updateDataModel.path === '/' || !updateDataModel.path) {
      entry.data = isRecord(updateDataModel.value) ? updateDataModel.value : {};
      return;
    }

    const key = updateDataModel.path.startsWith('/')
      ? updateDataModel.path.slice(1)
      : updateDataModel.path;
    if (updateDataModel.value === null) {
      delete entry.data[key];
    } else {
      entry.data[key] = updateDataModel.value;
    }
    return;
  }

  if ('updateComponents' in operation) {
    const entry = surfaces.get(operation.updateComponents.surfaceId);
    if (entry && operation.updateComponents.components?.[0]) {
      Object.assign(entry, normalizeComponent(operation.updateComponents.components[0]));
    }
    return;
  }

  if ('deleteSurface' in operation) {
    surfaces.delete(operation.deleteSurface.surfaceId);
  }
}
