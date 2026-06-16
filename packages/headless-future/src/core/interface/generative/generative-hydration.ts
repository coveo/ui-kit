import {createAction} from '@reduxjs/toolkit';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {STATE_ID} from '@/src/core/interface/utils/symbols.js';
import type {
  GenerativeInterfaceOptions,
  RoutedInterface,
  RoutedUseCase,
} from '@/src/core/interface/generative/generative-types.js';
import type {BuilderRegistry} from '@/src/public/interfaces/generative.js';
import type {HydrateSubInterface} from '@/src/core/interface/api/generative-endpoint/generative-runtime.js';
import {buildCommerceInterface} from '@/src/public/interfaces/commerce.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';

export const ACTIVITY_TYPE_TO_USE_CASE: Record<
  string,
  keyof GenerativeInterfaceOptions
> = {
  'commerce-search-api-response': 'commerceSearchControllers',
  'search-api-response': 'searchControllers',
};

const ACTIVITY_TYPE_TO_ROUTED_USE_CASE: Record<string, RoutedUseCase> = {
  'commerce-search-api-response': 'commerceSearch',
  'search-api-response': 'search',
};

/**
 * Creates a scoped hydration action for a given interface ID.
 * Each feature slice that supports hydration should listen to this action
 * in its `extraReducers` and extract the fields it cares about from the payload.
 */
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

export function createHydrateSubInterface(
  engine: Engine,
  builderRegistry: BuilderRegistry
): HydrateSubInterface {
  const fullEngine = getFullEngine(engine);

  return (activityType: string, content: unknown): RoutedInterface | null => {
    const useCase = ACTIVITY_TYPE_TO_USE_CASE[activityType];
    if (!useCase) {
      return null;
    }

    const subInterface =
      useCase === 'commerceSearchControllers'
        ? buildCommerceInterface({engine})
        : buildSearchInterface({engine});

    const builders = builderRegistry[useCase] ?? [];

    for (const builder of builders) {
      builder({interface: subInterface});
    }

    const subId = subInterface[STATE_ID];
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(subId);
    fullEngine.mutate(hydrateAction(content as Record<string, unknown>));

    return {
      useCase: ACTIVITY_TYPE_TO_ROUTED_USE_CASE[activityType],
      interface: subInterface,
    };
  };
}
