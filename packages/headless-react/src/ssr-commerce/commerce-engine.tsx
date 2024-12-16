import {
  Controller,
  ControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  defineCommerceEngine as defineBaseCommerceEngine,
  CommerceEngineOptions,
  SolutionType,
  CommerceEngine,
} from '@coveo/headless/ssr-commerce';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {singleton, SingletonGetter} from '../utils.js';
import {
  buildControllerHooks,
  buildEngineHook,
  buildHydratedStateProvider,
  buildStaticStateProvider,
} from './common.js';
import {
  ContextState,
  InferControllerHooksMapFromDefinition,
  ReactEngineDefinition,
} from './types.js';

export type ReactCommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = ReactEngineDefinition<TControllers, CommerceEngineOptions, TSolutionType>;

// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
export function createSingletonContext<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType = SolutionType,
>() {
  return singleton(() =>
    React.createContext<ContextState<TControllers, TSolutionType> | null>(null)
  );
}

/**
 * Returns controller hooks as well as SSR and CSR context providers that can be used to interact with a Commerce engine
 *  on the server and client side respectively.
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
        singletonContext as ListingContext
      ),

      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as ListingContext
      ),
    },
    searchEngineDefinition: {
      ...searchEngineDefinition,
      StaticStateProvider: buildStaticStateProvider(
        singletonContext as SearchContext
      ),
      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as SearchContext
      ),
    },
    standaloneEngineDefinition: {
      ...standaloneEngineDefinition,
      StaticStateProvider: buildStaticStateProvider(
        singletonContext as StandaloneContext
      ),
      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as StandaloneContext
      ),
    },
    recommendationEngineDefinition: {
      ...recommendationEngineDefinition,
      StaticStateProvider: buildStaticStateProvider(
        singletonContext as RecommendationContext
      ),
      HydratedStateProvider: buildHydratedStateProvider(
        singletonContext as RecommendationContext
      ),
    },
  };
}
