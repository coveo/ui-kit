import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {RoutedInterface, RoutedUseCase} from './generative-types.js';
import type {HydrateSubInterface} from '@/src/internal/api/generative/index.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/index.js';
import {SearchInterfaceImpl} from '@/src/internal/interfaces/index.js';
import {getOrCreateSearchBoxActions} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';
import {createConverseSearchFacadeResolver} from '@/src/internal/api/converse-search/index.js';

const ACTIVITY_TYPE_TO_ROUTED_USE_CASE: Record<string, RoutedUseCase> = {
  commerce_search_api_response: 'commerceSearch',
  search_api_response: 'search',
};

type HydrateAction = ReturnType<typeof createHydrateAction>;

const CACHE_KEY: CacheKey<HydrateAction> = createCacheKey<HydrateAction>(
  'generative/hydrateAction'
);

function createHydrateAction(interfaceId: string) {
  return createAction<Record<string, unknown>>(
    `${interfaceId}/hydrateFromSnapshot`
  );
}

export function getOrCreateHydrateFromSnapshotAction(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createHydrateAction(stateId)
  );
}

export function createHydrateSubInterface(
  fullEngine: FullEngine,
  generativeInterface: InterfaceHandle
): HydrateSubInterface {
  return (
    activityType: string,
    content: unknown,
    query?: string
  ): RoutedInterface | null => {
    const routedUseCase = ACTIVITY_TYPE_TO_ROUTED_USE_CASE[activityType];
    if (!routedUseCase) {
      return null;
    }

    const contentRecord = content as Record<string, unknown>;
    const effectiveQuery = extractEffectiveQuery(contentRecord, query);

    if (routedUseCase === 'commerceSearch') {
      const subInterface = new CommerceInterfaceImpl(fullEngine, generateId(), {
        search: createConverseSearchFacadeResolver(generativeInterface),
      });
      hydrate(fullEngine, subInterface, contentRecord, effectiveQuery);
      return {useCase: 'commerceSearch', interface: subInterface};
    }

    const subInterface = new SearchInterfaceImpl(fullEngine, generateId());
    hydrate(fullEngine, subInterface, contentRecord, effectiveQuery);
    return {useCase: 'search', interface: subInterface};
  };
}

function hydrate(
  fullEngine: FullEngine,
  subInterface: InterfaceHandle,
  contentRecord: Record<string, unknown>,
  effectiveQuery: string | undefined
): void {
  fullEngine.storeHydrationSnapshot(contentRecord, subInterface);
  const hydrateAction = getOrCreateHydrateFromSnapshotAction(subInterface);
  fullEngine.mutate(hydrateAction(contentRecord));
  if (effectiveQuery) {
    fullEngine.adoptSlice(getOrCreateSearchBoxSlice(subInterface));
    const searchBoxActions = getOrCreateSearchBoxActions(subInterface);
    fullEngine.mutate(searchBoxActions.setQuery(effectiveQuery));
  }
}

function extractEffectiveQuery(
  content: Record<string, unknown>,
  fallbackQuery?: string
): string | undefined {
  const queryCorrection = content.queryCorrection as
    | {correctedQuery?: string | null}
    | undefined
    | null;

  if (queryCorrection?.correctedQuery) {
    return queryCorrection.correctedQuery;
  }

  return fallbackQuery;
}
