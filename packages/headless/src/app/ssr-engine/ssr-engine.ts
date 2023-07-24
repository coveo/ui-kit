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

type HasKeys<TObject> = TObject extends {}
  ? keyof TObject extends never
    ? false
    : true
  : boolean;

export type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<CoreEngine, Controller>
> = TController extends ControllerDefinitionWithProps<
  CoreEngine,
  Controller,
  infer Props
>
  ? Props
  : TController extends ControllerDefinitionWithoutProps<CoreEngine, Controller>
  ? {}
  : unknown;

export type InferControllerPropsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = {
  [K in keyof TControllers as HasKeys<
    InferControllerPropsFromDefinition<TControllers[K]>
  > extends false
    ? never
    : K]: InferControllerPropsFromDefinition<TControllers[K]>;
};

export interface EngineAndControllers<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap
> {
  engine: TEngine;
  controllers: TControllers;
}

export interface ControllersMap {
  [customName: string]: Controller;
}

export interface BuildFunctionWithProps<
  TEngine extends CoreEngine,
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap
> {
  /**
   * Initializes an engine and controllers from the definition.
   */
  build(
    options: EngineDefinitionBuildOptionsWithProps<
      TEngineOptions,
      TControllersProps
    >
  ): Promise<EngineAndControllers<TEngine, TControllersMap>>;
}

export interface BuildFunctionWithoutProps<
  TEngine extends CoreEngine,
  TEngineOptions,
  TControllersMap extends ControllersMap
> {
  /**
   * Initializes an engine and controllers from the definition.
   */
  build(
    options?: EngineDefinitionBuildOptionsWithoutProps<TEngineOptions>
  ): Promise<EngineAndControllers<TEngine, TControllersMap>>;
}

export type ExecuteOnceFunctionWithoutProps<
  TControllersSnapshot extends ControllerSnapshotsMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchInitialState(): Promise<
    EngineSnapshot<TSearchFulfilledAction, TControllersSnapshot>
  >;
};

export interface EngineDefinitionHydrateOptionsWithoutProps<
  TSearchFulfilledAction extends AnyAction
> {
  searchFulfilledAction: TSearchFulfilledAction;
}

export type HydrateFunctionWithoutProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Creates a new engine from the snapshot of a previous engine.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  hydrateInitialState(
    options: EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction>
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};

export interface EngineDefinitionWithoutProps<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions
> extends ExecuteOnceFunctionWithoutProps<
      InferControllerSnapshotsMapFromDefinitions<TControllers>,
      AnyAction
    >,
    HydrateFunctionWithoutProps<
      TEngine,
      InferControllersMapFromDefinition<TControllers>,
      AnyAction
    >,
    BuildFunctionWithoutProps<
      TEngine,
      TEngineOptions,
      InferControllersMapFromDefinition<TControllers>
    > {}

export type EngineDefinitionExecuteOnceOptions<
  TControllersSnapshot extends ControllersPropsMap
> = {controllers: TControllersSnapshot};

export type ExecuteOnceFunctionWithProps<
  TControllersSnapshot extends ControllerSnapshotsMap,
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchInitialState(
    options: EngineDefinitionExecuteOnceOptions<TControllersProps>
  ): Promise<EngineSnapshot<TSearchFulfilledAction, TControllersSnapshot>>;
};

export interface EngineDefinitionHydrateOptionsWithProps<
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction> {
  controllers: TControllersProps;
}

export type HydrateFunctionWithProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> = {
  /**
   * Creates a new engine from the snapshot of a previous engine.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  hydrateInitialState(
    options: EngineDefinitionHydrateOptionsWithProps<
      TSearchFulfilledAction,
      TControllersProps
    >
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};

export interface EngineDefinitionWithProps<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
  TControllerProps extends ControllersPropsMap
> extends ExecuteOnceFunctionWithProps<
      InferControllerSnapshotsMapFromDefinitions<TControllers>,
      AnyAction,
      TControllerProps
    >,
    HydrateFunctionWithProps<
      TEngine,
      InferControllersMapFromDefinition<TControllers>,
      AnyAction,
      TControllerProps
    >,
    BuildFunctionWithProps<
      TEngine,
      TEngineOptions,
      InferControllersMapFromDefinition<TControllers>,
      TControllerProps
    > {}

export type EngineDefinition<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions
> = HasKeys<InferControllerPropsMapFromDefinitions<TControllers>> extends true
  ? EngineDefinitionWithProps<
      TEngine,
      TControllers,
      TEngineOptions,
      InferControllerPropsMapFromDefinitions<TControllers>
    >
  : InferControllerPropsMapFromDefinitions<TControllers> extends false
  ? EngineDefinitionWithoutProps<TEngine, TControllers, TEngineOptions>
  :
      | EngineDefinitionWithProps<
          TEngine,
          TControllers,
          TEngineOptions,
          ControllersPropsMap
        >
      | EngineDefinitionWithoutProps<TEngine, TControllers, TEngineOptions>;

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

export interface OptionsExtender<TOptions> {
  (options: TOptions): TOptions | Promise<TOptions>;
}

export interface EngineDefinitionBuildOptionsWithoutProps<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export interface ControllersPropsMap {
  [customName: string]: unknown;
}

export interface ControllerSnapshot<TState> {
  initialState: TState;
}

export interface ControllerSnapshotsMap {
  [customName: string]: ControllerSnapshot<unknown>;
}

export interface EngineDefinitionBuildOptionsWithProps<
  TEngineOptions,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionBuildOptionsWithoutProps<TEngineOptions> {
  controllers: TControllersProps;
}

type AnyAction = {type: string};

export interface EngineSnapshot<
  TSearchFulfilledAction extends AnyAction,
  TControllers extends ControllerSnapshotsMap
> {
  searchFulfilledAction: TSearchFulfilledAction;
  controllers: TControllers;
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
