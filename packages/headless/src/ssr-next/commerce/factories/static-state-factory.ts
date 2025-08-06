import type {UnknownAction} from '@reduxjs/toolkit';
import {buildProductListing} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../controllers/commerce/search/headless-search.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import {createStaticState} from '../controller-utils.js';
import {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
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

function wireControllerParams<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  solutionType: SolutionType,
  controllerDefinitions: TControllerDefinitions,
  params: FetchStaticStateParameters<TControllerDefinitions>
): BuildParameters<TControllerDefinitions> {
  if (!(params.length > 0 && params[0] && 'controllers' in params[0])) {
    return params as BuildParameters<TControllerDefinitions>;
  }

  const controllers = params[0].controllers as ControllersPropsMap;
  const {language, country, currency, cart} = params[0] as CommonFetchConfig;

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
        params[0] as FetchStaticStateOptions<SolutionType.search>;
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
      const {url, searchParams} =
        params[0] as FetchStaticStateOptions<SolutionType.listing>;
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
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return (
    solutionType: SolutionType
  ): FetchStaticStateFunction<TControllerDefinitions> =>
    async (...params: FetchStaticStateParameters<TControllerDefinitions>) => {
      // Transform the simplified config into the complex format expected by buildFactory
      const augmentedParams = wireControllerParams(
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
