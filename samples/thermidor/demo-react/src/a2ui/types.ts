type ComponentDefinition = {
  id: string;
  component: string;
} & Record<string, unknown>;

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
  components: ComponentDefinition[];
}

interface DeleteSurfaceOp {
  surfaceId: string;
}

type A2UIOperation =
  | {createSurface: CreateSurfaceOp}
  | {updateDataModel: UpdateDataModelOp}
  | {updateComponents: UpdateComponentsOp}
  | {deleteSurface: DeleteSurfaceOp}
  | {actionResponse: {actionId: string; response: unknown}};

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

interface SurfaceState {
  components: Map<string, ComponentDefinition>;
  data?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isComponentDefinition(value: unknown): value is ComponentDefinition {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.component === 'string' &&
    !Object.prototype.hasOwnProperty.call(value, 'componentProps')
  );
}

function isComponentDefinitions(value: unknown): value is ComponentDefinition[] {
  return Array.isArray(value) && value.every(isComponentDefinition);
}

function normalizeComponent(
  component: ComponentDefinition | undefined
): Pick<ParsedSurface, 'rootId' | 'componentType' | 'componentProps'> {
  if (!component) {
    return {
      rootId: 'root',
      componentType: '',
      componentProps: {},
    };
  }
  const {id, component: componentType, ...componentProps} = component;
  return {
    rootId: id,
    componentType,
    componentProps,
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
      return typeof message.actionId === 'string'
        ? {actionResponse: {actionId: message.actionId, response: message.actionResponse}}
        : undefined;
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
  return {createSurface: operation as CreateSurfaceOp};
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
  return {updateDataModel: operation as UpdateDataModelOp};
}

function getUpdateComponentsOperation(value: Record<string, unknown>): A2UIOperation | undefined {
  if (!isRecord(value.updateComponents)) {
    return undefined;
  }
  const operation = value.updateComponents;
  if (typeof operation.surfaceId !== 'string' || !isComponentDefinitions(operation.components)) {
    return undefined;
  }
  return {updateComponents: operation as UpdateComponentsOp};
}

function getDeleteSurfaceOperation(value: Record<string, unknown>): A2UIOperation | undefined {
  if (!isRecord(value.deleteSurface) || typeof value.deleteSurface.surfaceId !== 'string') {
    return undefined;
  }
  return {deleteSurface: value.deleteSurface as DeleteSurfaceOp};
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

  return Array.from(surfaces.entries()).map(([surfaceId, entry]) => ({
    surfaceId,
    ...normalizeComponent(entry.components.get('root')),
    data: entry.data ?? {},
  }));
}

function applyOperation(surfaces: Map<string, SurfaceState>, operation: A2UIOperation): void {
  if ('createSurface' in operation) {
    const createSurface = operation.createSurface;
    if (surfaces.has(createSurface.surfaceId)) {
      return;
    }
    surfaces.set(createSurface.surfaceId, {
      components: new Map(
        (createSurface.components ?? []).map((component) => [component.id, component])
      ),
      data: createSurface.dataModel,
    });
    return;
  }

  if ('updateDataModel' in operation) {
    const updateDataModel = operation.updateDataModel;
    const entry = surfaces.get(updateDataModel.surfaceId);
    if (!entry) {
      return;
    }
    entry.data = applyDataModelPatch(entry.data, updateDataModel.path, updateDataModel.value);
    return;
  }

  if ('updateComponents' in operation) {
    const entry = surfaces.get(operation.updateComponents.surfaceId);
    if (entry) {
      for (const component of operation.updateComponents.components) {
        entry.components.set(component.id, component);
      }
    }
    return;
  }

  if ('deleteSurface' in operation) {
    surfaces.delete(operation.deleteSurface.surfaceId);
  }
}

function applyDataModelPatch(
  current: Record<string, unknown> | undefined,
  path: string | undefined,
  value: unknown
): Record<string, unknown> | undefined {
  if (!path || path === '/') {
    return isRecord(value) ? value : undefined;
  }
  if (!path.startsWith('/')) {
    return current;
  }

  const segments = path
    .slice(1)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'));
  const root: Record<string, unknown> = {...(current ?? {})};
  let target: Record<string, unknown> | unknown[] = root;

  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index];
    const nextSegment = segments[index + 1];
    const existing = getContainerValue(target, segment);
    const child = isContainer(existing) ? cloneContainer(existing) : createContainer(nextSegment);
    setContainerValue(target, segment, child);
    target = child;
  }

  const leaf = segments.at(-1);
  if (leaf === undefined) {
    return root;
  }
  if (value === null) {
    deleteContainerValue(target, leaf);
  } else {
    setContainerValue(target, leaf, value);
  }
  return root;
}

function createContainer(nextSegment: string): Record<string, unknown> | unknown[] {
  return isArrayIndex(nextSegment) || nextSegment === '-' ? [] : {};
}

function cloneContainer(
  value: Record<string, unknown> | unknown[]
): Record<string, unknown> | unknown[] {
  return Array.isArray(value) ? [...value] : {...value};
}

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || isRecord(value);
}

function getContainerValue(container: Record<string, unknown> | unknown[], key: string): unknown {
  return Array.isArray(container) ? container[Number(key)] : container[key];
}

function setContainerValue(
  container: Record<string, unknown> | unknown[],
  key: string,
  value: unknown
): void {
  if (Array.isArray(container)) {
    if (key === '-') {
      container.push(value);
    } else if (isArrayIndex(key)) {
      container[Number(key)] = value;
    }
    return;
  }
  container[key] = value;
}

function deleteContainerValue(container: Record<string, unknown> | unknown[], key: string): void {
  if (Array.isArray(container)) {
    if (isArrayIndex(key)) {
      container.splice(Number(key), 1);
    }
    return;
  }
  delete container[key];
}

function isArrayIndex(value: string): boolean {
  return /^(0|[1-9]\d*)$/.test(value);
}
