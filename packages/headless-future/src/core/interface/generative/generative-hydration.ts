import {createAction} from '@reduxjs/toolkit';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {STATE_ID} from '@/src/core/interface/utils/symbols.js';
import type {
  RoutedInterface,
  RoutedUseCase,
} from '@/src/core/interface/generative/generative-types.js';
import type {HydrateSubInterface} from '@/src/core/interface/api/generative-endpoint/generative-runtime.js';
import {buildCommerceInterface} from '@/src/public/interfaces/commerce.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';

const ACTIVITY_TYPE_TO_ROUTED_USE_CASE: Record<string, RoutedUseCase> = {
  'commerce-search-api-response': 'commerceSearch',
  'search-api-response': 'search',
};

const hydrateActionCache = new Map<
  string,
  ReturnType<typeof createHydrateAction>
>();

function createHydrateAction(interfaceId: string) {
  return createAction<Record<string, unknown>>(
    `${interfaceId}/hydrateFromSnapshot`
  );
}

export function getOrCreateHydrateFromSnapshotAction(interfaceId: string) {
  if (!hydrateActionCache.has(interfaceId)) {
    hydrateActionCache.set(interfaceId, createHydrateAction(interfaceId));
  }
  return hydrateActionCache.get(interfaceId)!;
}

export function createHydrateSubInterface(engine: Engine): HydrateSubInterface {
  const fullEngine = getFullEngine(engine);

  return (activityType: string, content: unknown): RoutedInterface | null => {
    const routedUseCase = ACTIVITY_TYPE_TO_ROUTED_USE_CASE[activityType];
    if (!routedUseCase) {
      return null;
    }

    const contentRecord = content as Record<string, unknown>;

    if (routedUseCase === 'commerceSearch') {
      const subInterface = buildCommerceInterface({engine});
      const subId = subInterface[STATE_ID];
      fullEngine.storeHydrationSnapshot(subId, contentRecord);
      const hydrateAction = getOrCreateHydrateFromSnapshotAction(subId);
      fullEngine.mutate(hydrateAction(contentRecord));
      return {useCase: 'commerceSearch' as const, interface: subInterface};
    }

    const subInterface = buildSearchInterface({engine});
    const subId = subInterface[STATE_ID];
    fullEngine.storeHydrationSnapshot(subId, contentRecord);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(subId);
    fullEngine.mutate(hydrateAction(contentRecord));
    return {useCase: 'search' as const, interface: subInterface};
  };
}
