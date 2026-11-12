import {
  type AugmentedControllerDefinition,
  type CommerceEngine,
  type CommerceEngineDefinitionOptions,
  type Controller,
  type ControllerDefinition,
  type ControllerDefinitionsMap,
  defineCommerceEngine as defineBaseCommerceEngine,
  defineCart,
  defineContext,
  defineParameterManager,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {
  buildControllerHooks,
  buildEngineHook,
  buildHydrationHook,
  buildStateProvider,
  type EngineContext,
} from '../ssr-common/hooks.js';
import type {EngineContextState, Hydration} from '../ssr-common/types.js';
import {singleton} from '../utils.js';
import type {InferControllerHooksMapFromDefinition, ReactEngineDefinition} from './types.js';
/**
 * A React engine definition that includes context providers for static and hydrated states.
 *
 * @group Engine
 *  */
export type ReactCommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = ReactEngineDefinition<TControllers, TSolutionType>;

// TODO: remove hack: KIT-5009
// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
function createSingletonContext(): EngineContext<CommerceEngine> {
  return singleton(() => React.createContext<EngineContextState<CommerceEngine> | null>(null));
}

const getSupportedSolutionTypes = (definition: ControllerDefinition<Controller>) =>
  Object.values(SolutionType).filter((solutionType) => definition[solutionType] === true);

/**
 * Returns engine and controller hooks, and context providers.
 *
 * See [Define the commerce engine and controllers](https://docs.coveo.com/en/obif0156#define-the-commerce-engine-and-controllers).
 *
 * @group Engine
 */
export function defineCommerceEngine<TControllers extends ControllerDefinitionsMap<Controller>>(
  options: CommerceEngineDefinitionOptions<TControllers>
): {
  /**
   * Returns the engine once the static state is hydrated, and `undefined` before.
   */
  useEngine: () => CommerceEngine | undefined;
  /**
   * Returns whether the components render the static state, the hydrated engine, or a hydration error.
   */
  useHydration: () => Hydration;
  controllers: InferControllerHooksMapFromDefinition<AugmentedControllerDefinition<TControllers>>;
  listingEngineDefinition: ReactCommerceEngineDefinition<TControllers, SolutionType.listing>;
  searchEngineDefinition: ReactCommerceEngineDefinition<TControllers, SolutionType.search>;
  standaloneEngineDefinition: ReactCommerceEngineDefinition<TControllers, SolutionType.standalone>;
  recommendationEngineDefinition: ReactCommerceEngineDefinition<
    TControllers,
    SolutionType.recommendation
  >;
} {
  const singletonContext = createSingletonContext();

  const {
    listingEngineDefinition,
    searchEngineDefinition,
    standaloneEngineDefinition,
    recommendationEngineDefinition,
  } = defineBaseCommerceEngine({...options});

  const augmentedControllerDefinition = {
    ...options.controllers,
    parameterManager: defineParameterManager(),
    context: defineContext(),
    cart: defineCart(),
  } as AugmentedControllerDefinition<TControllers>;

  return {
    useEngine: buildEngineHook(singletonContext),
    useHydration: buildHydrationHook(singletonContext),
    controllers: buildControllerHooks(
      singletonContext,
      augmentedControllerDefinition,
      getSupportedSolutionTypes
    ) as InferControllerHooksMapFromDefinition<AugmentedControllerDefinition<TControllers>>,
    listingEngineDefinition: {
      ...listingEngineDefinition,
      StateProvider: buildStateProvider(singletonContext, SolutionType.listing),
    },
    searchEngineDefinition: {
      ...searchEngineDefinition,
      StateProvider: buildStateProvider(singletonContext, SolutionType.search),
    },
    standaloneEngineDefinition: {
      ...standaloneEngineDefinition,
      StateProvider: buildStateProvider(singletonContext, SolutionType.standalone),
    },
    recommendationEngineDefinition: {
      ...recommendationEngineDefinition,
      StateProvider: buildStateProvider(singletonContext, SolutionType.recommendation),
    },
  };
}
