import {createAction} from '@reduxjs/toolkit';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  RoutedInterface,
  RoutedUseCase,
} from '@/src/core/interface/generative/generative-types.js';
import type {HydrateSubInterface} from '@/src/core/interface/api/generative-endpoint/generative-runtime.js';
import {buildCommerceInterface} from '@/src/public/interfaces/commerce.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';

const ACTIVITY_TYPE_TO_ROUTED_USE_CASE: Record<string, RoutedUseCase> = {
  'commerce-search-api-response': 'commerceSearch',
  'search-api-response': 'search',
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

export function createHydrateSubInterface(engine: Engine): HydrateSubInterface {
  const fullEngine = getFullEngine(engine);

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
      const subInterface = buildCommerceInterface({engine});
      fullEngine.storeHydrationSnapshot(contentRecord, subInterface);
      const hydrateAction = getOrCreateHydrateFromSnapshotAction(subInterface);
      fullEngine.mutate(hydrateAction(contentRecord));
      if (effectiveQuery) {
        fullEngine.adoptSlice(getOrCreateSearchBoxSlice(subInterface));
        const searchBoxActions = getOrCreateSearchBoxActions(subInterface);
        fullEngine.mutate(searchBoxActions.setQuery(effectiveQuery));
      }
      return {useCase: 'commerceSearch' as const, interface: subInterface};
    }

    const subInterface = buildSearchInterface({engine});
    fullEngine.storeHydrationSnapshot(contentRecord, subInterface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(subInterface);
    fullEngine.mutate(hydrateAction(contentRecord));
    if (effectiveQuery) {
      fullEngine.adoptSlice(getOrCreateSearchBoxSlice(subInterface));
      const searchBoxActions = getOrCreateSearchBoxActions(subInterface);
      fullEngine.mutate(searchBoxActions.setQuery(effectiveQuery));
    }
    return {useCase: 'search' as const, interface: subInterface};
  };
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
