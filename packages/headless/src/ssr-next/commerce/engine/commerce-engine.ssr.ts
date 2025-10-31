/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */

import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {createAccessTokenManager} from '../../common/access-token-manager.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineContext} from '../controllers/context/headless-context.ssr.js';
import {defineParameterManager} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {hydratedRecommendationStaticStateFactory} from '../factories/recommendation-hydrated-state-factory.js';
import {fetchRecommendationStaticStateFactory} from '../factories/recommendation-static-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
} from '../types/controller-definitions.js';
import type {
  CommerceEngineDefinition,
  CommerceEngineDefinitionOptions,
} from '../types/engine.js';
import {validateControllerNames} from '../validation/controller-validation.js';

/**
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 *
 * @remarks
 * You can use the {@link InferStaticState} and {@link InferHydratedState} utility types with the returned engine definitions
 * to infer the types of static and hydrated state for your controllers.
 *
 * @example
 * ```ts
 * const { listingEngineDefinition } = defineCommerceEngine(engineConfig);
 *
 * const staticState = await listingEngineDefinition.fetchStaticState({
 *   navigatorContext: {/*...* /},
 *   context: {/*...* /},
 * });
 *
 * type SearchStaticState = InferStaticState<typeof listingEngineDefinition>;
 * type SearchHydratedState = InferHydratedState<typeof listingEngineDefinition>;
 * ```
 *
 * @group Engine
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): {
  listingEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.listing
  >;
  searchEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.search
  >;
  standaloneEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.standalone
  >;
  recommendationEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.recommendation
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  const tokenManager = createAccessTokenManager(
    engineOptions.configuration.accessToken
  );

  const onAccessTokenUpdate = (
    updateCallback: (accessToken: string) => void
  ) => {
    tokenManager.registerCallback(updateCallback);
  };

  const definitionOptions = {
    ...engineOptions,
    onAccessTokenUpdate,
  };

  const getAccessToken = () => tokenManager.getAccessToken();
  const setAccessToken = (accessToken: string) => {
    engineOptions.configuration.accessToken = accessToken;
    tokenManager.setAccessToken(accessToken);
  };

  controllerDefinitions && validateControllerNames(controllerDefinitions);

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
  const fetchRecommendationStaticState =
    fetchRecommendationStaticStateFactory<TControllerDefinitions>(
      augmentedControllerDefinition,
      definitionOptions
    );
  const hydrateRecommendationStaticState =
    hydratedRecommendationStaticStateFactory<TControllerDefinitions>(
      augmentedControllerDefinition,
      definitionOptions
    );
  const commonMethods = {
    getAccessToken,
    setAccessToken,
  };

  return {
    listingEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.listing),
      hydrateStaticState: hydrateStaticState(SolutionType.listing),
      ...commonMethods,
    },
    searchEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.search),
      hydrateStaticState: hydrateStaticState(SolutionType.search),
      ...commonMethods,
    },
    recommendationEngineDefinition: {
      fetchStaticState: fetchRecommendationStaticState,
      hydrateStaticState: hydrateRecommendationStaticState,
      ...commonMethods,
    },
    // TODO KIT-3738 :  The standaloneEngineDefinition should not be async since no request is sent to the API
    standaloneEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.standalone),
      hydrateStaticState: hydrateStaticState(SolutionType.standalone),
      ...commonMethods,
    },
  };
}
