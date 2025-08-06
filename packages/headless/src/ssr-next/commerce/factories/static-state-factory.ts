import type {UnknownAction} from '@reduxjs/toolkit';
import {buildProductListing} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../controllers/commerce/search/headless-search.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {createStaticState} from '../controller-utils.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerStaticStateMapFromDefinitionsWithSolutionType} from '../types/controller-inference.js';
import type {
  BuildParameters,
  CommerceControllerDefinitionsMap,
  EngineStaticState,
  FetchStaticStateFunction,
  FetchStaticStateParameters,
} from '../types/engine.js';
import type {
  CommonFetchConfig,
  FetchStaticStateOptions,
} from '../types/fetch-static-state.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
} from './build-factory.js';
import type {ParameterManagerDefinition} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {ContextDefinition} from '../controllers/context/headless-context.ssr.js';
import type {CartDefinition} from '../controllers/cart/headless-cart.ssr.js';

/**
 * Transform simplified config to the complex format expected by buildFactory
 */
// TODO: rename this function to be specific to fetchStaticState wiring
function augmentParams<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  solutionType: SolutionType,
  controllerDefinitions: TControllerDefinitions,
  params: FetchStaticStateParameters<TControllerDefinitions>
): BuildParameters<TControllerDefinitions> {
  if (!(params.length > 0 && params[0] && 'controllers' in params[0])) {
    return params as BuildParameters<TControllerDefinitions>;
  }

  const {controllers, ...config} = params[0];

  // TODO: not sure about that

  const {language, country, currency, cart} = config as CommonFetchConfig;
  if (controllerDefinitions && 'context' in controllerDefinitions) {
    controllers.context = {
      language: language,
      country: country,
      currency: currency,
    };
  }

  if (controllerDefinitions && 'cart' in controllerDefinitions && cart) {
    controllers.cart = {initialState: cart};
  }

  switch (solutionType) {
    case SolutionType.search: {
      const {query, searchParams} =
        config as FetchStaticStateOptions<SolutionType.search>;
      if (
        controllerDefinitions &&
        'parameterManager' in controllerDefinitions
      ) {
        controllers.parameterManager = {
          initialState: {
            parameters: {
              q: query,
              ...searchParams,
            },
          },
        };
      }
      break;
    }

    case SolutionType.listing: {
      const {url, language, country, currency, searchParams} =
        config as FetchStaticStateOptions<SolutionType.listing>;
      if (controllerDefinitions && 'context' in controllerDefinitions) {
        controllers.context = {
          view: {url},
          language,
          country,
          currency,
        };
      }

      if (
        controllerDefinitions &&
        'parameterManager' in controllerDefinitions &&
        searchParams
      ) {
        controllers.parameterManager = {
          initialState: {
            parameters: searchParams,
          },
        };
      }
      break;
    }

    case SolutionType.recommendation: {
      // const recConfig =
      //   config as FetchStaticStateOptions<SolutionType.recommendation>;
      // if (recConfig.recommendations) {
      //   recConfig.recommendations.forEach((rec, index) => {
      //     const key = `rec${index + 1}`;
      //     if (controllerDefinitions && key in controllerDefinitions) {
      //       complexConfig.controllers[key] = {
      //         slotId: rec.slotId,
      //         productId: rec.productId,
      //       };
      //     }
      //   });
      // }
      // TODO: later
      break;
    }

    case SolutionType.standalone:
      // No need for specific augmentations for standalone
      break;
  }

  return params as BuildParameters<TControllerDefinitions>;
}

export function fetchStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions & {
    // TODO: avoid replicating this type
    parameterManager: ParameterManagerDefinition<{listing: true; search: true}>; // TODO: KIT-4611: stop exposing this TOption param
    context: ContextDefinition;
    cart: CartDefinition;
  },
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return (
    solutionType: SolutionType
  ): FetchStaticStateFunction<TControllerDefinitions> =>
    async (...params: FetchStaticStateParameters<TControllerDefinitions>) => {
      // Transform the simplified config into the complex format expected by buildFactory
      const augmentedParams = augmentParams(
        solutionType,
        controllerDefinitions,
        params
      ) as BuildParameters<TControllerDefinitions>;

      const solutionTypeBuild = await buildFactory(controllerDefinitions, {
        ...options,
      })(solutionType);
      const {engine, controllers} = await solutionTypeBuild(...augmentedParams);

      options.configuration.preprocessRequest =
        augmentPreprocessRequestWithForwardedFor({
          preprocessRequest: options.configuration.preprocessRequest,
          navigatorContextProvider: options.navigatorContextProvider,
          loggerOptions: options.loggerOptions,
        });

      switch (solutionType) {
        case SolutionType.listing:
          buildProductListing(engine).executeFirstRequest();
          break;
        case SolutionType.search:
          buildSearch(engine).executeFirstSearch();
          break;
      }

      const searchActions = await Promise.all(
        engine.waitForRequestCompletedAction()
      );

      const staticState = createStaticState({
        searchActions,
        controllers,
      }) as EngineStaticState<
        UnknownAction,
        InferControllerStaticStateMapFromDefinitionsWithSolutionType<
          TControllerDefinitions,
          SolutionType
        >
      >;
      return staticState;
    };
}
