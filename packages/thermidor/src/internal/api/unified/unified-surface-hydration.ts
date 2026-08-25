import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle, CommerceInterface} from '@/src/internal/utils/index.js';
import {createNoopThunk, generateId} from '@/src/internal/utils/index.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/commerce.js';
import {createUnifiedSearchFacadeResolver} from './unified-search-facade.js';
import {
  createCommerceSearchEndpointResponseHandler,
  type CommerceSearchResponse,
} from '@/src/internal/api/commerce-search/index.js';
import type {CoveoFacetResponse} from '@/src/internal/api/search/index.js';
import {getOrCreateProductListActions} from '@/src/internal/features/product-list/index.js';
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/index.js';
import {getOrCreateFacetsActions} from '@/src/internal/features/facets/index.js';
import {
  fromCommerceApiSort,
  getOrCreateSortActions,
  type CommerceApiSortPayload,
} from '@/src/internal/features/sort/index.js';
import {getOrCreateTriggersActions} from '@/src/internal/features/triggers/index.js';
import {getOrCreateQueryCorrectionActions} from '@/src/internal/features/query-correction/index.js';

export interface A2uiSurfaceContent {
  messages: A2uiMessage[];
}

export type A2uiMessage =
  | {version: 'v1.0'; createSurface: CreateSurfacePayload}
  | {version: 'v1.0'; updateDataModel: UpdateDataModelPayload}
  | {version: 'v1.0'; updateComponents: UpdateComponentsPayload}
  | {version: 'v1.0'; deleteSurface: DeleteSurfacePayload}
  | {version: 'v1.0'; actionId: string; actionResponse: unknown};

export type A2uiOperation =
  | {createSurface: CreateSurfacePayload}
  | {updateDataModel: UpdateDataModelPayload}
  | {updateComponents: UpdateComponentsPayload}
  | {deleteSurface: DeleteSurfacePayload}
  | {actionResponse: {actionId: string; response: unknown}};

export interface CreateSurfacePayload {
  surfaceId: string;
  surfaceType?: string;
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

export interface UpdateComponentsPayload {
  surfaceId: string;
  components: ComponentNode[];
}

export interface DeleteSurfacePayload {
  surfaceId: string;
}

export interface UnifiedHydrationResult {
  surfaceId: string;
  useCase: 'commerceSearch';
  interface: CommerceInterface;
  snapshot: Record<string, unknown>;
  query: undefined;
}

const noopSuggestionsThunk = createNoopThunk('unified-surface-suggestions');

export function hydrateFromCreateSurface(
  engine: FullEngine,
  payload: CreateSurfacePayload,
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle
): UnifiedHydrationResult | null {
  if (!payload.dataModel) {
    return null;
  }

  if (!hasStatefulCommerceRootComponent(payload.components)) {
    return null;
  }

  const searchResolver = createUnifiedSearchFacadeResolver(
    generativeInterface,
    cartInterface,
    payload.surfaceId
  );
  const iface = new CommerceInterfaceImpl(engine, generateId(), {
    search: searchResolver,
    suggestions: (_iface) => noopSuggestionsThunk,
  });
  engine.storeHydrationSnapshot(payload.dataModel, iface);
  const handleResponse = createCommerceSearchEndpointResponseHandler(iface);
  handleResponse(engine, payload.dataModel as unknown as CommerceSearchResponse);

  return {
    surfaceId: payload.surfaceId,
    useCase: 'commerceSearch',
    interface: iface,
    snapshot: payload.dataModel,
    query: undefined,
  };
}

export function applyDataModelUpdate(
  engine: FullEngine,
  iface: InterfaceHandle,
  path: string | undefined,
  value: unknown
): void {
  if (!path || path === '/') {
    const handleResponse = createCommerceSearchEndpointResponseHandler(iface);
    handleResponse(engine, value as CommerceSearchResponse);
    return;
  }

  switch (path) {
    case '/products': {
      const productListActions = getOrCreateProductListActions(iface);
      engine.mutate(productListActions.setProductsFromResponse(value as never));
      break;
    }
    case '/pagination': {
      const paginationActions = getOrCreatePaginationActions(iface);
      const pagination = value as {
        page: number;
        perPage?: number;
        pageSize?: number;
        totalEntries: number;
      };
      const perPage = pagination.perPage ?? pagination.pageSize ?? 20;
      engine.mutate(paginationActions.setTotalCount(pagination.totalEntries));
      engine.mutate(paginationActions.setFirstResult(pagination.page * perPage));
      engine.mutate(paginationActions.setPageSize(perPage));
      break;
    }
    case '/facets': {
      const facetActions = getOrCreateFacetsActions(iface);
      engine.mutate(facetActions.updateFromResponse(value as unknown as CoveoFacetResponse[]));
      break;
    }
    case '/sort': {
      const sortActions = getOrCreateSortActions(iface);
      const sort = value as {
        appliedSort?: CommerceApiSortPayload;
        availableSorts?: CommerceApiSortPayload[];
      };
      if (!sort.appliedSort || !Array.isArray(sort.availableSorts)) {
        break;
      }
      engine.mutate(
        sortActions.updateFromResponse({
          appliedSort: fromCommerceApiSort(sort.appliedSort),
          availableSorts: sort.availableSorts.map(fromCommerceApiSort),
        })
      );
      break;
    }
    case '/triggers': {
      const triggersActions = getOrCreateTriggersActions(iface);
      engine.mutate(triggersActions.setTriggers(value as never));
      break;
    }
    case '/queryCorrection': {
      const queryCorrectionActions = getOrCreateQueryCorrectionActions(iface);
      engine.mutate(queryCorrectionActions.setQueryCorrection(value as never));
      break;
    }
    default:
      break;
  }
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
