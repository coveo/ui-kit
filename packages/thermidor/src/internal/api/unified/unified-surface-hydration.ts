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
  operations: A2uiOperation[];
}

export type A2uiOperation =
  | {createSurface: CreateSurfacePayload}
  | {updateDataModel: UpdateDataModelPayload}
  | {updateComponents: unknown}
  | {actionResponse: unknown};

export interface CreateSurfacePayload {
  surfaceId: string;
  catalogId?: string;
  surfaceProperties?: Record<string, unknown>;
  sendDataModel?: boolean;
  components?: unknown[];
  dataModel?: Record<string, unknown>;
}

export interface UpdateDataModelPayload {
  surfaceId: string;
  path?: string;
  value: unknown;
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

  if (payload.surfaceProperties?.placement !== 'main') {
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
  if (content && Array.isArray(content.operations)) {
    return content.operations as A2uiOperation[];
  }
  return [];
}
