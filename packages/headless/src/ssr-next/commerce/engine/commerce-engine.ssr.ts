/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */

import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineContext} from '../controllers/context/headless-context.ssr.js';
import {defineParameterManager} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
} from '../types/controller-definitions.js';
import type {CommerceEngineDefinition, CommerceEngineDefinitionOptions} from '../types/engine.js';
import {
  validateControllerNames,
  validateRecommendationSlots,
} from '../validation/controller-validation.js';

/**
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three engine definitions, one per kind of page: `listingEngineDefinition`, `searchEngineDefinition`
 *  and `standaloneEngineDefinition` (no listing or search request is sent to the API). Each exposes
 *  `fetchStaticState` to fetch the initial state on the server and `hydrateStaticState` to hydrate it in
 *  the browser. Recommendation slots are requested by any of them through the `recommendations` option of
 *  `fetchStaticState`.
 *
 * @remarks
 * You can use the {@link InferStaticState} and {@link InferHydratedState} utility types with the returned engine definitions
 * to infer the types of static and hydrated state for your controllers.
 *
 * @example
 * ```ts
 * const {listingEngineDefinition} = defineCommerceEngine(engineConfig);
 *
 * const staticState = await listingEngineDefinition.fetchStaticState({
 *   navigatorContext: {/*...* /},
 *   context: {/*...* /},
 *   recommendations: ['popularViewed'],
 * });
 *
 * type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;
 * type ListingHydratedState = InferHydratedState<typeof listingEngineDefinition>;
 * ```
 *
 * @group Engine
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): {
  listingEngineDefinition: CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>;
  searchEngineDefinition: CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>;
  standaloneEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.standalone
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  const definitionOptions = {...engineOptions};

  if (controllerDefinitions) {
    validateControllerNames(controllerDefinitions);
    validateRecommendationSlots(controllerDefinitions);
  }

  const augmentedControllerDefinition = {
    ...controllerDefinitions,
    parameterManager: defineParameterManager(),
    context: defineContext(),
    cart: defineCart(),
  } as AugmentedControllerDefinition<TControllerDefinitions>;

  const fetchStaticState = fetchStaticStateFactory<TControllerDefinitions>(
    augmentedControllerDefinition,
    definitionOptions
  );
  const hydrateStaticState = hydratedStaticStateFactory<TControllerDefinitions>(
    augmentedControllerDefinition,
    definitionOptions
  );
  return {
    listingEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.listing),
      hydrateStaticState: hydrateStaticState(SolutionType.listing),
    },
    searchEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.search),
      hydrateStaticState: hydrateStaticState(SolutionType.search),
    },
    standaloneEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.standalone),
      hydrateStaticState: hydrateStaticState(SolutionType.standalone),
    },
  };
}
