import type {Action, UnknownAction} from '@reduxjs/toolkit';
import {
  buildCommerceEngine,
  type CommerceEngine,
  type CommerceEngineOptions,
} from '../../../app/commerce-engine/commerce-engine.js';
import {buildLogger} from '../../../app/logger.js';
import {stateKey} from '../../../app/state-key.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {loadConfigurationActions} from '../../../features/commerce/configuration/configuration-actions-loader.js';
import {
  createWaitForActionMiddleware,
  createWaitForActionMiddlewareForRecommendation,
} from '../../../utils/utils.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import {buildControllerDefinitions} from '../controller-utils.js';
import {SolutionType} from '../types/controller-constants.js';
import type {ControllerDefinitionsMap} from '../types/controller-definitions.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {
  BuildParameters,
  CommerceControllerDefinitionsMap,
  EngineDefinitionOptions,
} from '../types/engine.js';

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

/**
 * SSR-specific commerce engine options with deprecated context property.
 */
export type SSRCommerceEngineOptions = Omit<CommerceEngineOptions, 'configuration'> & {
  configuration: Omit<CommerceEngineOptions['configuration'], 'context'> & {
    /**
     * @deprecated In the future major release, context should be provided through `fetchStaticState` rather than in the engine definition.
     *
     * @example
     * ```ts
     * engineDefinition = defineCommerceEngine({...});
     * engineDefinition.fetchStaticState({
     *   context: {...},
     * });
     * ```
     */
    context: CommerceEngineOptions['configuration']['context'];
  };
};

export type CommerceEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<Controller> = ControllerDefinitionsMap<Controller>,
> = EngineDefinitionOptions<SSRCommerceEngineOptions, TControllers> & {
  /**
   * Callback invoked when the access token changes.
   */
  onAccessTokenUpdate?: (updateCallback: (token: string) => void, owner: object) => void;
};

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
  options: SSRCommerceEngineOptions,
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

function fetchActiveRecommendationControllers(
  controllerProps: ControllersPropsMap,
  solutionType: SolutionType
): number {
  return solutionType === SolutionType.recommendation
    ? Object.values(controllerProps).filter(
        (controller) =>
          controller &&
          typeof controller === 'object' &&
          'enabled' in controller &&
          controller.enabled
      ).length
    : 0;
}

export const buildFactory =
  <TControllerDefinitions extends CommerceControllerDefinitionsMap>(
    controllerDefinitions: TControllerDefinitions | undefined,
    options: CommerceEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  <T extends SolutionType>(solutionType: T) =>
  async (...[buildOptions]: BuildParameters<TControllerDefinitions>) => {
    const logger = buildLogger(options.loggerOptions);

    const perRequestAccessToken =
      buildOptions && 'accessToken' in buildOptions ? buildOptions.accessToken : undefined;
    const perRequestNavigatorContext =
      buildOptions && 'navigatorContext' in buildOptions
        ? buildOptions.navigatorContext
        : undefined;

    // Warn only when NO navigator context is available for this request — neither a definition-level
    // provider nor a per-request `navigatorContext`. The per-request-only path (build({navigatorContext})
    // without setNavigatorContextProvider) is supported and must not log a false "missing" warning.
    if (!options.navigatorContextProvider && perRequestNavigatorContext === undefined) {
      logger.warn(
        '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
      );
    }

    const controllerProps =
      buildOptions && 'controllers' in buildOptions
        ? (buildOptions.controllers as ControllersPropsMap)
        : {};

    const enabledRecommendationControllers = fetchActiveRecommendationControllers(
      controllerProps,
      solutionType
    );

    // Apply the per-request access token BEFORE running `extend`, on a non-mutating copy of the
    // shared definition options, so the deprecated `extend` hook sees it and its return value wins
    // (documented precedence for the token). Without `extend`, the per-request token carries through.
    // Note: the per-request `navigatorContext` is applied AFTER `extend` (below), so `extend` does
    // not override it — this matches the intent that a request's own navigator context is authoritative.
    const optionsForRequest =
      perRequestAccessToken !== undefined
        ? {
            ...options,
            configuration: {
              ...options.configuration,
              accessToken: perRequestAccessToken,
            },
          }
        : options;

    const baseOptions =
      buildOptions && 'extend' in buildOptions && buildOptions?.extend
        ? await buildOptions.extend(optionsForRequest)
        : optionsForRequest;

    const navigatorContextProvider = perRequestNavigatorContext
      ? () => perRequestNavigatorContext
      : baseOptions.navigatorContextProvider;

    // Always build a per-request copy (never mutate the shared definition options). The
    // forwarded-for augmentation of preprocessRequest is applied per request, and the optional
    // per-request navigator context is layered on top. The per-request access token is already
    // present in `baseOptions.configuration` (applied before `extend` above).
    const engineOptions = {
      ...baseOptions,
      navigatorContextProvider,
      configuration: {
        ...baseOptions.configuration,
        preprocessRequest: augmentPreprocessRequestWithForwardedFor({
          preprocessRequest: baseOptions.configuration.preprocessRequest,
          navigatorContextProvider,
          loggerOptions: baseOptions.loggerOptions,
        }),
      },
    };

    const engine = buildSSRCommerceEngine(
      solutionType,
      engineOptions,
      enabledRecommendationControllers
    );

    const updateEngineConfiguration = (accessToken: string) => {
      const {updateBasicConfiguration} = loadConfigurationActions(engine);
      engine.dispatch(
        updateBasicConfiguration({
          accessToken,
        })
      );
    };

    // Subscribe this engine to shared token updates ONLY when it uses the definition's token. When
    // a per-request access token is supplied, the override must stay authoritative for this request:
    // subscribing would let a queued/concurrent `setAccessToken()` overwrite it (violating the
    // "this call only" contract), so we skip the shared subscription entirely.
    if (options.onAccessTokenUpdate && perRequestAccessToken === undefined) {
      options.onAccessTokenUpdate(updateEngineConfiguration, engine);
    }

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
