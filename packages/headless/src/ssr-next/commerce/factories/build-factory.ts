import type {Action, UnknownAction} from '@reduxjs/toolkit';
import {
  buildCommerceEngine,
  type CommerceEngine,
  type CommerceEngineOptions,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {
  createWaitForActionMiddleware,
  createWaitForActionMiddlewareForRecommendation,
} from '../../../utils/utils.js';
import {buildControllerDefinitions} from '../controller-utils.js';
import type {BuildParameters} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
} from '../types/engine.js';
import type {CommerceHydratedState} from '../types/hydrate-static-state.js';
import {wireControllerParams} from '../utils/controller-wiring.js';
import {augmentCommerceEngineOptions} from '../utils/engine-wiring.js';

/**
 * The SSR commerce engine.
 *
 * @group Engine
 */
export interface SSRCommerceEngine extends CommerceEngine {
  /**
   * Returns one promise per request that this engine waits for, each resolving to the action that completes the request.
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
  let actionCompletionMiddleware: ReturnType<typeof createWaitForActionMiddleware>;

  const middlewares: ReturnType<typeof createWaitForActionMiddleware>[] = [];
  const memo: Set<string> = new Set();

  switch (solutionType) {
    case SolutionType.listing:
      actionCompletionMiddleware = createWaitForActionMiddleware(isListingFetchCompletedAction);
      middlewares.push(actionCompletionMiddleware);
      break;
    case SolutionType.search:
      actionCompletionMiddleware = createWaitForActionMiddleware(isSearchCompletedAction);
      middlewares.push(actionCompletionMiddleware);
      break;
    case SolutionType.recommendation:
      middlewares.push(
        ...Array.from({length: recommendationCount}, () =>
          createWaitForActionMiddlewareForRecommendation(isRecommendationCompletedAction, memo)
        )
      );
      break;
    case SolutionType.standalone:
      actionCompletionMiddleware = createWaitForActionMiddleware(noSearchActionRequired);
      break;
    default:
      throw new Error('Unsupported solution type', solutionType);
  }

  const commerceEngine = buildCommerceEngine({
    ...options,
    middlewares: [...(options.middlewares ?? []), ...middlewares.map(({middleware}) => middleware)],
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
    controllerDefinitions: TControllerDefinitions,
    options: CommerceEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  <TSolutionType extends SolutionType>(solutionType: TSolutionType) =>
  async (buildOptions: BuildParameters<TControllerDefinitions>) => {
    const controllerProps = wireControllerParams(solutionType, controllerDefinitions, buildOptions);

    const enabledRecommendationControllers =
      'recommendations' in buildOptions ? new Set(buildOptions.recommendations).size : 0;

    const engineOptions: CommerceEngineOptions = augmentCommerceEngineOptions(
      options,
      buildOptions
    );

    const engine = buildSSRCommerceEngine(
      solutionType,
      engineOptions,
      enabledRecommendationControllers
    );

    const controllers: Record<string, Controller> = buildControllerDefinitions({
      definitionsMap: controllerDefinitions ?? {},
      engine,
      solutionType,
      propsMap: controllerProps,
    });

    buildOptions.searchActions?.forEach((action) => {
      engine.dispatch(action);
    });

    return {
      engine,
      controllers: controllers as CommerceHydratedState<
        TControllerDefinitions,
        TSolutionType
      >['controllers'],
    };
  };
