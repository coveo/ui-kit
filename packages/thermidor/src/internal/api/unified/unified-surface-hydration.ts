import type {FullEngine} from '@/src/internal/engine/index.js';
import type {CommerceInterface} from '@/src/internal/utils/index.js';
import {createNoopThunk, generateId} from '@/src/internal/utils/index.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/commerce.js';

export type A2uiOperation =
  | {createSurface: CreateSurfacePayload}
  | {updateDataModel: UpdateDataModelPayload}
  | {updateComponents: UpdateComponentsPayload}
  | {deleteSurface: DeleteSurfacePayload}
  | {actionResponse: {actionId: string; response: unknown}};

export interface CreateSurfacePayload {
  surfaceId: string;
  catalogId?: string;
  sendDataModel?: boolean;
  components?: ComponentNode[];
  dataModel?: Record<string, unknown>;
}

export type ComponentNode = {
  id: string;
  component: string;
} & Record<string, unknown>;

export interface UpdateDataModelPayload {
  surfaceId: string;
  path?: string;
  value: unknown;
}

interface UpdateComponentsPayload {
  surfaceId: string;
  components: ComponentNode[];
}

interface DeleteSurfacePayload {
  surfaceId: string;
}

export interface UnifiedHydrationResult {
  surfaceId: string;
  useCase: 'commerceSearch';
  interface: CommerceInterface;
  snapshot: Record<string, unknown>;
  query: undefined;
}

const noopThunk = createNoopThunk('unified-surface-noop');

export function hydrateFromCreateSurface(
  engine: FullEngine,
  payload: CreateSurfacePayload
): UnifiedHydrationResult | null {
  if (!payload.dataModel) {
    return null;
  }

  if (!hasStatefulCommerceRootComponent(payload.components)) {
    return null;
  }

  const iface = new CommerceInterfaceImpl(engine, generateId(), {
    search: (_iface) => noopThunk,
    suggestions: (_iface) => noopThunk,
  });
  engine.storeHydrationSnapshot(payload.dataModel, iface);

  return {
    surfaceId: payload.surfaceId,
    useCase: 'commerceSearch',
    interface: iface,
    snapshot: payload.dataModel,
    query: undefined,
  };
}

export function extractA2uiOperations(content: Record<string, unknown>): A2uiOperation[] {
  if (!Array.isArray(content.messages)) {
    return [];
  }

  return content.messages.flatMap(parseA2uiMessage);
}

function parseA2uiMessage(message: unknown): A2uiOperation[] {
  if (!isRecord(message) || message.version !== 'v1.0') {
    return [];
  }

  const operationKeys = [
    'createSurface',
    'updateDataModel',
    'updateComponents',
    'deleteSurface',
    'actionResponse',
  ].filter((key) => Object.prototype.hasOwnProperty.call(message, key));
  if (operationKeys.length !== 1) {
    return [];
  }

  switch (operationKeys[0]) {
    case 'createSurface':
      return isCreateSurfacePayload(message.createSurface)
        ? [{createSurface: message.createSurface}]
        : [];
    case 'updateDataModel':
      return isUpdateDataModelPayload(message.updateDataModel)
        ? [{updateDataModel: message.updateDataModel}]
        : [];
    case 'updateComponents':
      return isUpdateComponentsPayload(message.updateComponents)
        ? [{updateComponents: message.updateComponents}]
        : [];
    case 'deleteSurface':
      return isDeleteSurfacePayload(message.deleteSurface)
        ? [{deleteSurface: message.deleteSurface}]
        : [];
    case 'actionResponse':
      return typeof message.actionId === 'string'
        ? [{actionResponse: {actionId: message.actionId, response: message.actionResponse}}]
        : [];
    default:
      return [];
  }
}

function hasStatefulCommerceRootComponent(components: ComponentNode[] | undefined): boolean {
  const root = components?.find((component) => component.id === 'root');
  return root?.component === 'ProductSearchSurface' || root?.component === 'ProductListingSurface';
}

function isCreateSurfacePayload(value: unknown): value is CreateSurfacePayload {
  if (!isRecord(value) || typeof value.surfaceId !== 'string') {
    return false;
  }
  if (value.catalogId !== undefined && typeof value.catalogId !== 'string') {
    return false;
  }
  if (value.sendDataModel !== undefined && typeof value.sendDataModel !== 'boolean') {
    return false;
  }
  if (value.components !== undefined && !isComponentNodes(value.components)) {
    return false;
  }
  return value.dataModel === undefined || isRecord(value.dataModel);
}

function isUpdateDataModelPayload(value: unknown): value is UpdateDataModelPayload {
  return (
    isRecord(value) &&
    typeof value.surfaceId === 'string' &&
    Object.prototype.hasOwnProperty.call(value, 'value') &&
    (value.path === undefined || typeof value.path === 'string')
  );
}

function isUpdateComponentsPayload(value: unknown): value is UpdateComponentsPayload {
  return (
    isRecord(value) && typeof value.surfaceId === 'string' && isComponentNodes(value.components)
  );
}

function isDeleteSurfacePayload(value: unknown): value is DeleteSurfacePayload {
  return isRecord(value) && typeof value.surfaceId === 'string';
}

function isComponentNodes(value: unknown): value is ComponentNode[] {
  return Array.isArray(value) && value.every(isComponentNode);
}

function isComponentNode(value: unknown): value is ComponentNode {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.component === 'string' &&
    !Object.prototype.hasOwnProperty.call(value, 'componentProps')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
