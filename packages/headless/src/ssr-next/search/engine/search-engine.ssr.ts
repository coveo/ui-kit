/**
 * Utility functions to be used for Server Side Rendering.
 */
import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../../app/navigator-context-provider.js';
import {
  buildSearchEngine,
  type SearchEngine,
  type SearchEngineOptions,
} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {LegacySearchAction} from '../../../features/analytics/analytics-utils.js';
import {createWaitForActionMiddleware} from '../../../utils/utils.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {
  buildControllerDefinitions,
  createStaticState,
} from '../../common/controller-utils.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import type {
  EngineDefinition,
  EngineDefinitionOptions,
  EngineStaticState,
} from '../../common/types/engine.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
} from '../../common/types/inference.js';

/**
 * The SSR search engine.
 */
export interface SSRSearchEngine extends SearchEngine {
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

export type SearchCompletedAction = ReturnType<
  LegacySearchAction['fulfilled' | 'rejected']
>;

function isSearchCompletedAction(
  action: unknown
): action is SearchCompletedAction {
  return /^search\/executeSearch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function buildSSRSearchEngine(options: SearchEngineOptions): SSRSearchEngine {
  const {middleware, promise} = createWaitForActionMiddleware(
    isSearchCompletedAction
  );
  const searchEngine = buildSearchEngine({
    ...options,
    middlewares: [...(options.middlewares ?? []), middleware],
  });
  return {
    ...searchEngine,
    get state() {
      return searchEngine.state;
    },
    waitForSearchCompletedAction() {
      return promise;
    },
  };
}

export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinition<SSRSearchEngine, TControllers>;

/**
 * Initializes a Search engine definition in SSR with per-call navigator context support.
 *
 * @param options - The search engine definition
 * @returns Engine definition with support for per-call navigator context.
 *
 * @example
 * ```ts
 * const searchEngine = defineSearchEngine(config);
 *
 * // Pass navigator context directly to fetchStaticState
 * const staticState = await searchEngine.fetchStaticState({
 *   navigatorContext: {
 *     forwardedFor: req.ip,
 *     referrer: req.headers.referer || null,
 *     userAgent: req.headers['user-agent'] || null,
 *     clientId: 'abc123'
 *   }
 * });
 * ```
 *
 * @group Engine
 */
export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>(options: SearchEngineDefinitionOptions<TControllerDefinitions>) {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  // biome-ignore lint/suspicious/noExplicitAny: Complex parameter typing would require extensive refactoring
  const hydrateStaticState = async (...params: any[]) => {
    const engine = buildSSRSearchEngine(engineOptions);
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      propsMap:
        {} as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });

    const [staticState] = params;
    engine.dispatch(staticState.searchAction);
    await engine.waitForSearchCompletedAction();
    return {engine, controllers};
  };

  // biome-ignore lint/suspicious/noExplicitAny: Parameter typing matches the interface contract
  const fetchStaticState = async (...params: any[]) => {
    const [callOptions] = params as unknown as [
      | {navigatorContext?: NavigatorContext | NavigatorContextProvider}
      | undefined,
    ];

    // Convert per-call navigator context to provider function
    const navigatorContextProvider = callOptions?.navigatorContext
      ? typeof callOptions.navigatorContext === 'function'
        ? (callOptions.navigatorContext as NavigatorContextProvider)
        : () => callOptions.navigatorContext as NavigatorContext
      : undefined;

    // Create options for this call with navigator context
    const callSpecificOptions: SearchEngineDefinitionOptions<TControllerDefinitions> =
      {
        ...options,
        navigatorContextProvider,
        configuration: {
          ...options.configuration,
          preprocessRequest: navigatorContextProvider
            ? augmentPreprocessRequestWithForwardedFor({
                preprocessRequest: options.configuration.preprocessRequest,
                navigatorContextProvider,
                loggerOptions: options.loggerOptions,
              })
            : options.configuration.preprocessRequest,
        },
      };

    const engine = buildSSRSearchEngine(callSpecificOptions);
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      propsMap: (callOptions && 'controllers' in callOptions
        ? callOptions.controllers
        : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });

    engine.executeFirstSearch();
    const staticState = createStaticState({
      searchAction: await engine.waitForSearchCompletedAction(),
      controllers: controllers,
    }) as EngineStaticState<
      UnknownAction,
      InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
    >;

    return staticState;
  };

  return {
    fetchStaticState,
    hydrateStaticState,
  } as EngineDefinition<SSRSearchEngine, TControllerDefinitions>;
}
