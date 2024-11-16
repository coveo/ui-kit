import {Action, UnknownAction} from '@reduxjs/toolkit';
import {stateKey} from '../../../app/state-key.js';
import {Controller} from '../../../controllers/controller/headless-controller.js';
import {
  createWaitForActionMiddleware,
  createWaitForActionMiddlewareForRecommendation,
} from '../../../utils/utils.js';
import {
  buildCommerceEngine,
  CommerceEngine,
  CommerceEngineOptions,
} from '../../commerce-engine/commerce-engine.js';
import {buildLogger} from '../../logger.js';
import {buildControllerDefinitions} from '../common.js';
import {
  ControllerDefinitionsMap,
  InferControllerPropsMapFromDefinitions,
  SolutionType,
} from '../types/common.js';
import {
  BuildParameters,
  EngineDefinitionOptions,
} from '../types/core-engine.js';

// TODO: rename
export interface RecommendationExtraOptions {
  // TODO: rename
  count: number;
}

/**
 * The SSR commerce engine.
 */
export interface SSRCommerceEngine extends CommerceEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForRequestCompletedAction(): Promise<Action>[];
}

export type CommerceEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
> = EngineDefinitionOptions<CommerceEngineOptions, TControllers>;

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
  <
    TControllerDefinitions extends ControllerDefinitionsMap<
      SSRCommerceEngine,
      Controller
    >,
  >(
    controllerDefinitions: TControllerDefinitions,
    options: CommerceEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  <T extends SolutionType>(
    solutionType: T,
    solutionTypeOptions?: RecommendationExtraOptions
  ) =>
  async (...[buildOptions]: BuildParameters<TControllerDefinitions>) => {
    const logger = buildLogger(options.loggerOptions);
    if (!options.navigatorContextProvider) {
      logger.warn(
        '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
      );
    }
    const engine = buildSSRCommerceEngine(
      solutionType,
      buildOptions && 'extend' in buildOptions && buildOptions?.extend
        ? await buildOptions.extend(options)
        : options,
      solutionType === SolutionType.recommendation
        ? solutionTypeOptions?.count || 0
        : 0
    );
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      solutionType,
      propsMap: (buildOptions && 'controllers' in buildOptions
        ? buildOptions.controllers
        : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });

    return {
      engine,
      controllers,
    };
  };
