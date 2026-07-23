import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {RoutedUseCase} from './generative-types.js';
import type {
  HydrateSubInterface,
  HydrationResult,
} from '@/src/internal/api/generative/index.js';
import type {RoutedInterfaceRegistry} from './routed-interface-registry.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/index.js';
import {SearchInterfaceImpl} from '@/src/internal/interfaces/index.js';
import {getOrCreateSearchBoxActions} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';
import {createConverseSearchFacadeResolver} from '@/src/internal/api/converse-search/index.js';

const ACTIVITY_TYPE_TO_ROUTED_USE_CASE: Record<string, RoutedUseCase> = {
  commerce_search_api_response: 'commerceSearch',
  search_api_response: 'search',
};

const ROUTED_USE_CASE_TO_ACTIVITY_TYPE: Record<RoutedUseCase, string> = {
  commerceSearch: 'commerce_search_api_response',
  search: 'search_api_response',
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
  ): HydrationResult | null => {
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
      return {
        useCase: 'commerceSearch' as const,
        interface: subInterface,
        snapshot: contentRecord,
        query: effectiveQuery,
      };
    }

    const subInterface = new SearchInterfaceImpl(fullEngine, generateId());
    hydrate(fullEngine, subInterface, contentRecord, effectiveQuery);
    return {
      useCase: 'search' as const,
      interface: subInterface,
      snapshot: contentRecord,
      query: effectiveQuery,
    };
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

export function rehydrateRoutedInterfaces(
  turns: {
    id: string;
    routedInterface?: {
      useCase: string;
      snapshot: Record<string, unknown>;
      query: string | undefined;
    };
  }[],
  registry: RoutedInterfaceRegistry,
  hydrateSubInterface: HydrateSubInterface
): void {
  for (const turn of turns) {
    if (!turn.routedInterface) {
      continue;
    }

    const activityType =
      ROUTED_USE_CASE_TO_ACTIVITY_TYPE[
        turn.routedInterface.useCase as RoutedUseCase
      ];
    if (!activityType) {
      continue;
    }

    const hydrationResult = hydrateSubInterface(
      activityType,
      turn.routedInterface.snapshot,
      turn.routedInterface.query
    );

    if (hydrationResult) {
      registry.register(turn.id, {
        useCase: hydrationResult.useCase,
        interface: hydrationResult.interface,
        snapshot: hydrationResult.snapshot,
        query: hydrationResult.query,
      });
    }
  }
}
