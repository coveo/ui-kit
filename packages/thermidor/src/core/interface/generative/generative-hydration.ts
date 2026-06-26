import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {STATE_ID} from '@/src/core/interface/utils/symbols.js';
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

function createHydrateAction(interfaceId: string) {
  return createAction<Record<string, unknown>>(
    `${interfaceId}/hydrateFromSnapshot`
  );
}

export const getOrCreateHydrateFromSnapshotAction =
  SingletonFactory(createHydrateAction);

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
      const subId = subInterface[STATE_ID];
      fullEngine.storeHydrationSnapshot(subId, contentRecord);
      const hydrateAction = getOrCreateHydrateFromSnapshotAction(subId);
      fullEngine.mutate(hydrateAction(contentRecord));
      if (effectiveQuery) {
        fullEngine.adoptSlice(getOrCreateSearchBoxSlice(subId));
        const searchBoxActions = getOrCreateSearchBoxActions(subId);
        fullEngine.mutate(searchBoxActions.setQuery(effectiveQuery));
      }
      return {useCase: 'commerceSearch' as const, interface: subInterface};
    }

    const subInterface = buildSearchInterface({engine});
    const subId = subInterface[STATE_ID];
    fullEngine.storeHydrationSnapshot(subId, contentRecord);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(subId);
    fullEngine.mutate(hydrateAction(contentRecord));
    if (effectiveQuery) {
      fullEngine.adoptSlice(getOrCreateSearchBoxSlice(subId));
      const searchBoxActions = getOrCreateSearchBoxActions(subId);
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
