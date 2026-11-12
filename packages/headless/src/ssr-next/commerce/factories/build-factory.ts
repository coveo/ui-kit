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
import {SolutionType} from '../types/controller-constants.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  FetchStaticStateParameters,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import type {CommerceHydratedState} from '../types/hydrate-static-state.js';
import {validateBuildConfig} from '../utils/controller-wiring.js';
import {resolveEnableResults} from '../utils/enable-results.js';
import {augmentCommerceEngineOptions} from '../utils/engine-wiring.js';
import {withDefaultViewUrl} from '../utils/view-url.js';

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

function buildSSRCommerceEngine(
  solutionType: SolutionType,
  options: CommerceEngineOptions,
  recommendationCount: number
): SSRCommerceEngine {
  const middlewares: ReturnType<typeof createWaitForActionMiddleware>[] = [];
  const memo: Set<string> = new Set();

  switch (solutionType) {
    case SolutionType.listing:
      middlewares.push(createWaitForActionMiddleware(isListingFetchCompletedAction));
      break;
    case SolutionType.search:
      middlewares.push(createWaitForActionMiddleware(isSearchCompletedAction));
      break;
    case SolutionType.standalone:
      break;
    default:
      throw new Error('Unsupported solution type', solutionType);
  }

  // One request per requested recommendation slot, whatever the kind of page.
  middlewares.push(
    ...Array.from({length: recommendationCount}, () =>
      createWaitForActionMiddlewareForRecommendation(isRecommendationCompletedAction, memo)
    )
  );

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
  async (
    rawBuildOptions:
      | FetchStaticStateParameters<TControllerDefinitions, TSolutionType>
      | HydrateStaticStateParameters<TControllerDefinitions, TSolutionType>
  ) => {
    const buildOptions = withDefaultViewUrl(rawBuildOptions);
    validateBuildConfig(solutionType, controllerDefinitions, buildOptions);

    const enableResults = resolveEnableResults(options.enableResults);
    const enabledRecommendationControllers = buildOptions.recommendations?.length ?? 0;

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
      buildConfig: buildOptions,
      enableResults,
    });

    if (buildOptions && 'searchActions' in buildOptions) {
      buildOptions.searchActions.forEach((action) => {
        engine.dispatch(action);
      });
    }

    return {
      engine,
      controllers: controllers as CommerceHydratedState<
        TControllerDefinitions,
        TSolutionType
      >['controllers'],
    };
  };
