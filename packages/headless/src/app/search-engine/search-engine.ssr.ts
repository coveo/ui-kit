/**
 * Utility functions to be used for Server Side Rendering.
 */
import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../controllers';
import {SearchAction} from '../../features/analytics/analytics-utils';
import {createWaitForActionMiddleware} from '../../utils/utils';
import {
  buildControllerDefinitions,
  createStaticState,
} from '../ssr-engine/common';
import {EngineDefinitionBuildOptionsWithProps} from '../ssr-engine/types/build';
import {
  ControllerDefinitionsMap,
  EngineStaticState,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
  OptionsExtender,
} from '../ssr-engine/types/common';
import {
  EngineDefinition,
  EngineDefinitionOptions,
} from '../ssr-engine/types/core-engine';
import {
  SearchEngine,
  SearchEngineOptions,
  buildSearchEngine,
} from './search-engine';

/**
 * @internal
 */
export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
> = EngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

/**
 * @internal
 */
export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

export type SearchCompletedAction = ReturnType<
  SearchAction['fulfilled' | 'rejected']
>;

function isSearchCompletedAction(
  action: AnyAction
): action is SearchCompletedAction {
  return /^search\/executeSearch\/(fulfilled|rejected)$/.test(action.type);
}

/**
 * @internal
 *
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 * @returns Three utility functions to fetch initial state of engine in SSR, hydrate the state in CSR
 *  and a build function that can be used for edge cases requiring more control.
 */
export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>({
  controllers: controllerDefinitions,
  ...engineOptions
}: SearchEngineDefinitionOptions<TControllerDefinitions>): SearchEngineDefinition<TControllerDefinitions> {
  const build: SearchEngineDefinition<TControllerDefinitions>['build'] = async (
    ...[buildOptions]: Parameters<
      SearchEngineDefinition<TControllerDefinitions>['build']
    >
  ) => {
    const engine = buildSearchEngine(
      buildOptions?.extend
        ? await buildOptions.extend(engineOptions)
        : engineOptions
    );
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      propsMap: (buildOptions && 'controllers' in buildOptions
        ? buildOptions.controllers
        : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });
    return {
      engine,
      controllers,
    };
  };

  const fetchStaticState: SearchEngineDefinition<TControllerDefinitions>['fetchStaticState'] =
    async (
      ...[executeOptions]: Parameters<
        SearchEngineDefinition<TControllerDefinitions>['fetchStaticState']
      >
    ): Promise<
      EngineStaticState<
        {type: string},
        InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
      >
    > => {
      const {middleware, promise: searchCompletedPromise} =
        createWaitForActionMiddleware(isSearchCompletedAction);

      const extend: OptionsExtender<SearchEngineOptions> = (options) => ({
        ...options,
        middlewares: [...(options.middlewares ?? []), middleware],
      });
      const {engine, controllers} = await build({
        extend,
        ...(executeOptions?.controllers && {
          controllers: executeOptions.controllers,
        }),
      });

      engine.executeFirstSearch();
      return createStaticState({
        searchAction: await searchCompletedPromise,
        controllers,
      });
    };

  const hydrateStaticState: SearchEngineDefinition<TControllerDefinitions>['hydrateStaticState'] =
    async (
      ...[hydrateOptions]: Parameters<
        SearchEngineDefinition<TControllerDefinitions>['hydrateStaticState']
      >
    ) => {
      const {engine, controllers} = await build(
        'controllers' in hydrateOptions
          ? ({
              controllers: hydrateOptions.controllers,
            } as EngineDefinitionBuildOptionsWithProps<
              SearchEngineOptions,
              TControllerDefinitions
            >)
          : {}
      );
      engine.dispatch(hydrateOptions.searchAction);
      return {engine, controllers};
    };

  return {
    build,
    fetchStaticState,
    hydrateStaticState,
  };
}
