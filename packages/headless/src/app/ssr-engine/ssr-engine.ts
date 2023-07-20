/**
 * Utility functions to be used for Server Side Rendering.
 */
import {Middleware} from '@reduxjs/toolkit';
import {Controller} from '../../controllers';
import {CoreEngine} from '../engine';
import {EngineConfiguration} from '../engine-configuration';
import {
  SearchEngine,
  SearchEngineOptions,
  buildSearchEngine,
} from '../search-engine/search-engine';

export interface ControllerDefinitionWithoutProps<
  TEngine extends CoreEngine,
  TController extends Controller
> {
  build(engine: TEngine): TController;
}

export interface ControllerDefinitionWithProps<
  TEngine extends CoreEngine,
  TController extends Controller,
  TProps
> {
  buildWithProps(engine: TEngine, props: TProps): TController;
}

export type ControllerDefinition<
  TEngine extends CoreEngine,
  TController extends Controller
> =
  | ControllerDefinitionWithoutProps<TEngine, TController>
  | ControllerDefinitionWithProps<TEngine, TController, unknown>;

export interface ControllerDefinitionsMap<
  TEngine extends CoreEngine,
  TController extends Controller
> {
  [customName: string]: ControllerDefinition<TEngine, TController>;
}

export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = TOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: TControllers;
};

export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
  // TODO: try to import a simplified version of  EngineDefinition
> = EngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<CoreEngine, Controller>
> = TDefinition extends ControllerDefinition<infer _, infer TController>
  ? TController
  : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = {[K in keyof TControllers]: InferControllerFromDefinition<TControllers[K]>};

export type InferControllerSnapshotsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = {[K in keyof TControllers]: {initialState: TControllers[K]}};

export function mapObject<TKey extends string, TInitialValue, TNewValue>(
  obj: Record<TKey, TInitialValue>,
  predicate: (value: TInitialValue, key: TKey) => TNewValue
): Record<TKey, TNewValue> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      predicate(value as TInitialValue, key as TKey),
    ])
  ) as Record<TKey, TNewValue>;
}

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
        EngineSnapshot<
          {type: string},
          InferControllerSnapshotsMapFromDefinitions<TControllerDefinitions>
        >
      >(async (resolve, reject) => {
        const middleware: Middleware = () => (next) => (action) => {
          next(action);
          if (action.type === 'search/executeSearch/fulfilled') {
            resolve({
              controllers: mapObject(controllers, (controller) => ({
                initialState: controller.state,
              })) as InferControllerSnapshotsMapFromDefinitions<TControllerDefinitions>,
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
        const {engine, controllers} = await build({
          extend,
          ...(executeOptions?.controllers && {
            controllers: executeOptions.controllers,
          }),
        });
        engine.executeFirstSearch();
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
