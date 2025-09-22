import {
  type CommerceEngine,
  type CommerceEngineDefinitionOptions,
  type CommerceEngineOptions,
  type Controller,
  type ControllerDefinitionsMap,
  defineCommerceEngine as defineBaseCommerceEngine,
  SolutionType,
} from '@coveo/headless/ssr-commerce';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {type SingletonGetter, singleton} from '../utils.js';
import {
  buildControllerHooks,
  buildEngineHook,
  buildHydratedStateProvider,
  buildStateProvider,
  buildStaticStateProvider,
} from './common.js';
import type {
  ContextState,
  InferControllerHooksMapFromDefinition,
  ReactEngineDefinition,
} from './types.js';

/**
 * A React engine definition that includes context providers for static and hydrated states.
 *
 * @group Engine
 *  */
export type ReactCommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = ReactEngineDefinition<TControllers, CommerceEngineOptions, TSolutionType>;

// TODO: remove hack: KIT-5009
// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
function createSingletonContext<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType = SolutionType,
>() {
  return singleton(() =>
    React.createContext<ContextState<TControllers, TSolutionType> | null>(null)
  );
}

/**
 * Returns engine and controller hooks, and context providers.
 *
 * See [Define the commerce engine and controllers](https://docs.coveo.com/en/obif0156#define-the-commerce-engine-and-controllers).
 *
 * @group Engine
 */
export function defineCommerceEngine<
  TControllers extends ControllerDefinitionsMap<Controller>,
>(
  options: CommerceEngineDefinitionOptions<TControllers>
): {
  useEngine: () => CommerceEngine | undefined;
  controllers: InferControllerHooksMapFromDefinition<TControllers>;
  listingEngineDefinition: ReactCommerceEngineDefinition<
    TControllers,
    SolutionType.listing
  >;
  searchEngineDefinition: ReactCommerceEngineDefinition<
    TControllers,
    SolutionType.search
  >;
  standaloneEngineDefinition: ReactCommerceEngineDefinition<
    TControllers,
    SolutionType.standalone
  >;
  recommendationEngineDefinition: ReactCommerceEngineDefinition<
    TControllers,
    SolutionType.recommendation
  >;
} {
  const singletonContext = createSingletonContext<TControllers>();

  type ContextStateType<TSolutionType extends SolutionType> = SingletonGetter<
    React.Context<ContextState<TControllers, TSolutionType> | null>
  >;
  type ListingContext = ContextStateType<SolutionType.listing>;
  type SearchContext = ContextStateType<SolutionType.search>;
  type RecommendationContext = ContextStateType<SolutionType.recommendation>;
  type StandaloneContext = ContextStateType<SolutionType.standalone>;

  const {
    listingEngineDefinition,
    searchEngineDefinition,
    standaloneEngineDefinition,
    recommendationEngineDefinition,
  } = defineBaseCommerceEngine({...options});
  return {
    useEngine: buildEngineHook(singletonContext),
    controllers: buildControllerHooks(singletonContext, options.controllers),
    listingEngineDefinition: {
      ...listingEngineDefinition,
      StaticStateProvider: buildStaticStateProvider(
        singletonContext as ListingContext,
        SolutionType.listing
      ),

      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as ListingContext,
        SolutionType.listing
      ),

      StateProvider: buildStateProvider(
        singletonContext as ListingContext,
        SolutionType.listing
      ),
    },
    searchEngineDefinition: {
      ...searchEngineDefinition,
      StaticStateProvider: buildStaticStateProvider(
        singletonContext as SearchContext,
        SolutionType.search
      ),
      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as SearchContext,
        SolutionType.search
      ),
      StateProvider: buildStateProvider(
        singletonContext as SearchContext,
        SolutionType.search
      ),
    },
    standaloneEngineDefinition: {
      ...standaloneEngineDefinition,
      StaticStateProvider: buildStaticStateProvider(
        singletonContext as StandaloneContext,
        SolutionType.standalone
      ),
      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as StandaloneContext,
        SolutionType.standalone
      ),
      StateProvider: buildStateProvider(
        singletonContext as StandaloneContext,
        SolutionType.standalone
      ),
    },
    recommendationEngineDefinition: {
      ...recommendationEngineDefinition,
      StaticStateProvider: buildStaticStateProvider(
        singletonContext as RecommendationContext,
        SolutionType.recommendation
      ),
      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as RecommendationContext,
        SolutionType.recommendation
      ),
      StateProvider: buildStateProvider(
        singletonContext as RecommendationContext,
        SolutionType.recommendation
      ),
    },
  };
}
