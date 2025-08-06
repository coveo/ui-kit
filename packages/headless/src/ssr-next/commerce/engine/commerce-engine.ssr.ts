/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */

import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {definePagination} from '../controllers/pagination/headless-core-commerce-pagination.ssr.js';
import {
  ContextDefinition,
  defineContext,
} from '../controllers/context/headless-context.ssr.js';
import {
  defineParameterManager,
  ParameterManagerDefinition,
} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import {
  CartDefinition,
  defineCart,
  defineCustomController,
} from '../controllers/cart/headless-cart.ssr.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {hydratedRecommendationStaticStateFactory} from '../factories/recommendation-hydrated-state-factory.js';
import {fetchRecommendationStaticStateFactory} from '../factories/recommendation-static-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import {SolutionType} from '../types/controller-constants.js';
import type {ControllerDefinitionsMap} from '../types/controller-definitions.js';
import type {CommerceEngineDefinition} from '../types/engine.js';

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
 * const engineDefinition = defineCommerceEngine(engineConfig);
 * type SearchStaticState = InferStaticState<typeof engineDefinition>;
 * type SearchHydratedState = InferHydratedState<typeof engineDefinition>;
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

  const getOptions = () => engineOptions;

  const setNavigatorContextProvider = (
    navigatorContextProvider: NavigatorContextProvider
  ) => {
    engineOptions.navigatorContextProvider = navigatorContextProvider;
  };

  const getAccessToken = () => engineOptions.configuration.accessToken;

  const setAccessToken = (accessToken: string) => {
    engineOptions.configuration.accessToken = accessToken;
  };

  // TODO: runtime validation to ensure the user did not enter controllers with the names of context, cart and parameterManager
  const validateControllerNames = (controllers: Record<string, unknown>) => {
    const reservedNames = ['context', 'cart', 'parameterManager'];
    const invalidNames = Object.keys(controllers).filter((name) =>
      reservedNames.includes(name)
    );
    if (invalidNames.length > 0) {
      throw new Error(
        `Reserved controller names found: ${invalidNames.join(', ')}. Please use different controller names than ${reservedNames.join(', ')}.`
      );
    }
  };
  controllerDefinitions && validateControllerNames(controllerDefinitions);

  const augmentedControllerDefinitions = {
    ...controllerDefinitions,
    parameterManager: defineParameterManager(),
    context: defineContext(),
    cart: defineCart(),
  } as TControllerDefinitions & {
    parameterManager: ParameterManagerDefinition<{listing: true; search: true}>; // TODO: KIT-4611: stop exposing this TOption param
    context: ContextDefinition;
    cart: CartDefinition;
  };

  const fetchStaticState = fetchStaticStateFactory<TControllerDefinitions>(
    augmentedControllerDefinitions,
    getOptions()
  );
  const hydrateStaticState = hydratedStaticStateFactory<TControllerDefinitions>(
    augmentedControllerDefinitions,
    getOptions()
  );
  const fetchRecommendationStaticState =
    fetchRecommendationStaticStateFactory<TControllerDefinitions>(
      augmentedControllerDefinitions,
      getOptions()
    );
  const hydrateRecommendationStaticState =
    hydratedRecommendationStaticStateFactory<TControllerDefinitions>(
      augmentedControllerDefinitions,
      getOptions()
    );
  const commonMethods = {
    setNavigatorContextProvider,
    getAccessToken,
    setAccessToken,
  };

  return {
    listingEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.listing),
      hydrateStaticState: hydrateStaticState(SolutionType.listing),
      ...commonMethods,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>,
    searchEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.search),
      hydrateStaticState: hydrateStaticState(SolutionType.search),
      ...commonMethods,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>,
    recommendationEngineDefinition: {
      fetchStaticState: fetchRecommendationStaticState,
      hydrateStaticState: hydrateRecommendationStaticState,
      ...commonMethods,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.recommendation
    >,
    // TODO KIT-3738 :  The standaloneEngineDefinition should not be async since no request is sent to the API
    standaloneEngineDefinition: {
      fetchStaticState: fetchStaticState(SolutionType.standalone),
      hydrateStaticState: hydrateStaticState(SolutionType.standalone),
      ...commonMethods,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.standalone
    >,
  };
}

async function main() {
  const {
    listingEngineDefinition,
    searchEngineDefinition,
    standaloneEngineDefinition,
    recommendationEngineDefinition,
  } = defineCommerceEngine({
    controllers: {
      // param: defineParameterManager(),
      // context: defineContext(),
      // cart: defineCart(),
      // TODO: add warning if the user tries to register parameterManager, context, or cart
      customController: defineCustomController(),
      products: defineProductList(),
      context: defineProductList(), // should throw an error
      pagination: definePagination({
        options: {
          pageSize: 1,
        },
      }),
      rec1: defineRecommendations({
        options: {
          slotId: 's',
        },
      }),
    },
    configuration: getSampleCommerceEngineConfiguration(),
  });

  const staticState = await listingEngineDefinition.fetchStaticState({
    cart: {
      items: [],
    },
    country: 'CA',
    currency: 'CAD',
    language: 'fr',
    url: '/products/laptops',
    controllers: {
      customController: {
        foo: 'bar',
      },
    },
  });
  // console.log('*********************');
  // console.log('00000', staticState.controllers.context);
  // console.log('*********************');

  const hydrated =
    await listingEngineDefinition.hydrateStaticState(staticState);
  // TODO: should always be included in the controller list RETURN ONLY !!!!!!
  // That means update the hydrateStatic return type to contains those
  console.log('********************ssssss*');
  console.log(hydrated.controllers);
  console.log('*********************');
}

main();
