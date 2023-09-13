/**
 * Utility functions to be used for Server Side Rendering.
 */
import {Middleware} from '@reduxjs/toolkit';
import {Controller} from '../../controllers';
import {mapObject} from '../../utils/utils';
import {EngineDefinitionBuildOptionsWithProps} from '../ssr-engine/types/build';
import {
  ControllerDefinitionsMap,
  ControllersMap,
  EngineStaticState,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
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
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

/**
 * @internal
 */
export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

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
  >
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
    const controllerOptions =
      buildOptions && 'controllers' in buildOptions
        ? buildOptions.controllers
        : null;
    const controllers = controllerDefinitions
      ? mapObject(controllerDefinitions, (definition, key) =>
          'build' in definition
            ? definition.build(engine)
            : definition.buildWithProps(
                engine,
                controllerOptions?.[key as keyof typeof controllerOptions]
              )
        )
      : {};
    return {
      engine,
      controllers:
        controllers as InferControllersMapFromDefinition<TControllerDefinitions>,
    };
  };

  const fetchStaticState: SearchEngineDefinition<TControllerDefinitions>['fetchStaticState'] =
    (
      ...[executeOptions]: Parameters<
        SearchEngineDefinition<TControllerDefinitions>['fetchStaticState']
      >
    ) =>
      new Promise<
        EngineStaticState<
          {type: string},
          InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
        >
      >((resolve, reject) => {
        let staticControllers: ControllersMap;
        const middleware: Middleware = () => (next) => (action) => {
          next(action);
          if (action.type === 'search/executeSearch/fulfilled') {
            resolve({
              controllers: mapObject(staticControllers, (controller) => ({
                state: controller.state,
              })) as InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>,
              searchFulfilledAction: JSON.parse(JSON.stringify(action)),
            });
          }
          if (action.type === 'search/executeSearch/rejected') {
            reject(JSON.parse(JSON.stringify(action)));
          }
        };

        const extend: OptionsExtender<SearchEngineOptions> = (options) => ({
          ...options,
          middlewares: [...(options.middlewares ?? []), middleware],
        });

        build({
          extend,
          ...(executeOptions?.controllers && {
            controllers: executeOptions.controllers,
          }),
        }).then(({engine, controllers}) => {
          staticControllers = controllers;
          engine.executeFirstSearch();
        });
      });

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
      engine.dispatch(hydrateOptions.searchFulfilledAction);
      return {engine, controllers};
    };

  return {
    build,
    fetchStaticState,
    hydrateStaticState,
  };
}
