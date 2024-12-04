import {Action, UnknownAction} from '@reduxjs/toolkit';
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
import {stateKey} from '../../state-key.js';
import {buildControllerDefinitions} from '../common.js';
import {
  ControllerDefinitionsMap,
  InferControllerPropsMapFromDefinitions,
  SolutionType,
} from '../types/common.js';
import {
  BuildParameters,
  CommerceControllerDefinitionsMap,
  EngineDefinitionOptions,
} from '../types/core-engine.js';

/**
 * The SSR commerce engine.
 */
export interface SSRCommerceEngine extends CommerceEngine {
  /**
   * Waits for the request to be completed and returns a promise that resolves to an `Action`.
   */
  waitForRequestCompletedAction(): Promise<Action>[];
}

export type CommerceEngineDefinitionOptions<
  TControllers extends
    ControllerDefinitionsMap<Controller> = ControllerDefinitionsMap<Controller>,
> = EngineDefinitionOptions<CommerceEngineOptions, TControllers>;

function isRecommendationCompletedAction(action: unknown): action is Action {
  return /^commerce\/recommendations\/fetch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function buildSSRCommerceEngine(
  options: CommerceEngineOptions,
  recommendationCount: number
): SSRCommerceEngine {
  const middlewares: ReturnType<typeof createWaitForActionMiddleware>[] = [];
  const memo: Set<string> = new Set();

  middlewares.push(
    ...Array.from({length: recommendationCount}, () =>
      createWaitForActionMiddlewareForRecommendation(
        isRecommendationCompletedAction,
        memo
      )
    )
  );

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

export const recommendationBuildFactory =
  <TControllerDefinitions extends CommerceControllerDefinitionsMap>(
    controllerDefinitions: TControllerDefinitions | undefined,
    options: CommerceEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  <T extends SolutionType>(
    solutionType: T // TODO: get rid of this. since it is a recommendation specific factory
  ) =>
  async (...[buildOptions]: BuildParameters<TControllerDefinitions>) => {
    const logger = buildLogger(options.loggerOptions);
    if (!options.navigatorContextProvider) {
      logger.warn(
        '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
      );
    }

    const cleanedBuildOptions = Object.values(
      buildOptions && 'controllers' in buildOptions
        ? buildOptions.controllers
        : {}
    ).filter(
      (controller) =>
        // TODO: simplify
        controller &&
        typeof controller === 'object' &&
        'enabled' in controller &&
        controller.enabled
    );

    const engine = buildSSRCommerceEngine(
      buildOptions && 'extend' in buildOptions && buildOptions?.extend
        ? await buildOptions.extend(options)
        : options,
      cleanedBuildOptions.length
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
