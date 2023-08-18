/**
 * Utility functions to be used for Server Side Rendering.
 */
import {Middleware} from '@reduxjs/toolkit';
import {Controller} from '../../controllers';
import {mapObject} from '../../utils/utils';
import {
  SearchEngine,
  SearchEngineOptions,
  buildSearchEngine,
} from '../search-engine/search-engine';
import {EngineDefinitionBuildOptionsWithProps} from './types/build';
import {
  ControllerDefinitionsMap,
  ControllersMap,
  EngineSSRState,
  InferControllerSSRStateMapFromDefinitions,
  InferControllersMapFromDefinition,
  OptionsExtender,
} from './types/common';
import {
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
} from './types/search-engine';

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

  const fetchInitialState: SearchEngineDefinition<TControllerDefinitions>['fetchInitialState'] =
    (
      ...[executeOptions]: Parameters<
        SearchEngineDefinition<TControllerDefinitions>['fetchInitialState']
      >
    ) =>
      new Promise<
        EngineSSRState<
          {type: string},
          InferControllerSSRStateMapFromDefinitions<TControllerDefinitions>
        >
      >((resolve, reject) => {
        let initialControllers: ControllersMap;
        const middleware: Middleware = () => (next) => (action) => {
          next(action);
          if (action.type === 'search/executeSearch/fulfilled') {
            resolve({
              controllers: mapObject(initialControllers, (controller) => ({
                state: controller.state,
              })) as InferControllerSSRStateMapFromDefinitions<TControllerDefinitions>,
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
          initialControllers = controllers;
          engine.executeFirstSearch();
        });
      });

  const hydrateInitialState: SearchEngineDefinition<TControllerDefinitions>['hydrateInitialState'] =
    async (
      ...[hydrateOptions]: Parameters<
        SearchEngineDefinition<TControllerDefinitions>['hydrateInitialState']
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
    fetchInitialState,
    hydrateInitialState,
  };
}
