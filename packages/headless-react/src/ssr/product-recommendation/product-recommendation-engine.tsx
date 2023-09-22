import {
  Controller,
  ProductRecommendationEngine,
  ControllerDefinitionsMap,
  ProductRecommendationEngineDefinitionOptions,
  defineProductRecommendationEngine as defineBaseProductRecommendationEngine,
  ProductRecommendationEngineOptions,
} from '@coveo/headless/ssr/product-recommendation';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {ContextState, ReactEngineDefinition} from '../types.js';
import {singleton} from '../../utils.js';
import {
  buildControllerHooks,
  buildEngineHook,
  buildHydratedStateProvider,
  buildStaticStateProvider,
} from '../common.js';

export type ReactProductRecommendationEngineDefinition<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
> = ReactEngineDefinition<
  ProductRecommendationEngine,
  TControllers,
  ProductRecommendationEngineOptions
>;

// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
export function createSingletonContext<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
>() {
  return singleton(() =>
    React.createContext<ContextState<
      ProductRecommendationEngine,
      TControllers
    > | null>(null)
  );
}

/**
 * @internal
 * Returns controller hooks and SSR, CSR context providers that can be used to interact with a search engine
 *  in the server and client side respectively.
 */
export function defineProductRecommendationEngine<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
>(
  options: ProductRecommendationEngineDefinitionOptions<TControllers>
): ReactProductRecommendationEngineDefinition<TControllers> {
  const singletonContext = createSingletonContext<TControllers>();
  return {
    ...defineBaseProductRecommendationEngine({...options}),
    useEngine: buildEngineHook(singletonContext),
    controllers: buildControllerHooks(singletonContext, options.controllers),
    StaticStateProvider: buildStaticStateProvider(singletonContext),
    HydratedStateProvider: buildHydratedStateProvider(singletonContext),
  };
}
