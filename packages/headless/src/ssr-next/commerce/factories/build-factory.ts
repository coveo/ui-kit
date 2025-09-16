import type {Action, UnknownAction} from '@reduxjs/toolkit';
import {
  buildCommerceEngine,
  type CommerceEngine,
  type CommerceEngineOptions,
} from '../../../app/commerce-engine/commerce-engine.js';
import {buildLogger} from '../../../app/logger.js';
import {stateKey} from '../../../app/state-key.js';
import {
  createWaitForActionMiddleware,
  createWaitForActionMiddlewareForRecommendation,
} from '../../../utils/utils.js';
import {buildControllerDefinitions} from '../controller-utils.js';
import type {RecommendationBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  AugmentedControllerDefinition,
  BakedInControllers,
} from '../types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  FetchStaticStateParameters,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {wireControllerParams} from '../utils/controller-wiring.js';
import {extendEngineConfiguration} from '../utils/engine-wiring.js';

/**
 * The SSR commerce engine.
 *
 * @group Engine
 */
export interface SSRCommerceEngine extends CommerceEngine {
  /**
   * Waits for the request to be completed and returns a promise that resolves to an `Action`.
   */
  waitForRequestCompletedAction(): Promise<Action>[];
}

function isListingFetchCompletedAction(action: unknown): action is Action {
  return /^commerce\/productListing\/fetch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function isSearchCompletedAction(action: unknown): action is Action {
  return /^commerce\/search\/executeSearch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function isRecommendationCompletedAction(action: unknown): action is Action {
  return /^commerce\/recommendations\/fetch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function noSearchActionRequired(_action: unknown): _action is Action {
  return true;
}

function buildSSRCommerceEngine(
  solutionType: SolutionType,
  options: CommerceEngineOptions,
  recommendationCount: number
): SSRCommerceEngine {
  let actionCompletionMiddleware: ReturnType<
    typeof createWaitForActionMiddleware
  >;

  const middlewares: ReturnType<typeof createWaitForActionMiddleware>[] = [];
  const memo: Set<string> = new Set();

  switch (solutionType) {
    case SolutionType.listing:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isListingFetchCompletedAction
      );
      middlewares.push(actionCompletionMiddleware);
      break;
    case SolutionType.search:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isSearchCompletedAction
      );
      middlewares.push(actionCompletionMiddleware);
      break;
    case SolutionType.recommendation:
      middlewares.push(
        ...Array.from({length: recommendationCount}, () =>
          createWaitForActionMiddlewareForRecommendation(
            isRecommendationCompletedAction,
            memo
          )
        )
      );
      break;
    case SolutionType.standalone:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        noSearchActionRequired
      );
      break;
    default:
      throw new Error('Unsupported solution type', solutionType);
  }

  const commerceEngine = buildCommerceEngine({
    ...options,
    middlewares: [
      ...(options.middlewares ?? []),
      ...middlewares.map(({middleware}) => middleware),
    ],
  });

  return {
    ...commerceEngine,

    get [stateKey]() {
      return commerceEngine[stateKey];
    },

    waitForRequestCompletedAction() {
      return [...middlewares.map(({promise}) => promise)];
    },
  };
}

export const buildFactory =
  <TControllerDefinitions extends CommerceControllerDefinitionsMap>(
    controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
    options: CommerceEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  <TSolutionType extends SolutionType>(solutionType: TSolutionType) =>
  async (
    ...[buildOptions]:
      | FetchStaticStateParameters<TControllerDefinitions, TSolutionType>
      | HydrateStaticStateParameters<TControllerDefinitions, TSolutionType>
  ) => {
    const controllerProps = wireControllerParams(
      solutionType,
      controllerDefinitions,
      buildOptions!
    ); // TODO: KIT-4754: remove non-null assertion operator

    const logger = buildLogger(options.loggerOptions);
    if (!options.navigatorContextProvider) {
      logger.warn(
        '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
      );
    }

    const enabledRecommendationControllers =
      buildOptions && 'recommendations' in buildOptions // TODO: KIT-4754: remove non-null assertion
        ? (buildOptions as RecommendationBuildConfig<TControllerDefinitions>)
            ?.recommendations.length
        : 0;

    const engineOptions = {
      ...options,
      configuration: extendEngineConfiguration(
        options.configuration,
        buildOptions!
      ), // TODO: KIT-4754: remove non-null assertion operator
    };
    const engine = buildSSRCommerceEngine(
      solutionType,
      engineOptions,
      enabledRecommendationControllers
    );

    const controllers = buildControllerDefinitions({
      definitionsMap: controllerDefinitions ?? {},
      engine,
      solutionType,
      propsMap: controllerProps,
    });

    if (buildOptions && 'searchActions' in buildOptions) {
      buildOptions.searchActions.forEach((action) => {
        engine.dispatch(action);
      });
    }

    return {
      engine,
      controllers: controllers as InferControllersMapFromDefinition<
        TControllerDefinitions,
        TSolutionType
      > &
        BakedInControllers,
    };
  };
