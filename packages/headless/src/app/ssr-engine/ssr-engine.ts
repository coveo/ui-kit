/**
 * Utility functions to be used for Server Side Rendering.
 */
import {AnyAction, Middleware} from '@reduxjs/toolkit';
import {Controller} from '../../controllers';
import {CoreEngine} from '../engine';
import {EngineConfiguration} from '../engine-configuration';
import {
  SearchEngine,
  SearchEngineOptions,
  buildSearchEngine,
} from '../search-engine/search-engine';
import {
  BuildWithProps,
  BuildWithoutProps,
  ControllerDefinitionWithProps,
  ControllerDefinitionWithoutProps,
  EngineDefinitionBuildOptionsWithProps,
} from './build-ssr-types';
import {
  ControllersMap,
  ControllersPropsMap,
  OptionsExtender,
} from './common-ssr-types';

/**
 * TODO:
 * - Simplify (number of steps required for) async hydration
 * - Try to simplify the following types
 *  - Can variations with/without props e.g. be combined/simplified?
 * Style
 * - `BuildWith..` -> `BuilderWith..`? Similarly `Fetcher..`, `Hydrator..`
 **/

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

export type FetchInitialStateWithoutProps<
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

export type HydrateInitialStateWithoutProps<
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
> extends FetchInitialStateWithoutProps<
      InferControllerSnapshotsMapFromDefinitions<TControllers>,
      AnyAction
    >,
    HydrateInitialStateWithoutProps<
      TEngine,
      InferControllersMapFromDefinition<TControllers>,
      AnyAction
    >,
    BuildWithoutProps<
      TEngine,
      TEngineOptions,
      InferControllersMapFromDefinition<TControllers>
    > {}

export type EngineDefinitionFetchInitialStateOptions<
  TControllersSnapshot extends ControllersPropsMap
> = {controllers: TControllersSnapshot};

export type FetchInitialStateWithProps<
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
    options: EngineDefinitionFetchInitialStateOptions<TControllersProps>
  ): Promise<EngineSnapshot<TSearchFulfilledAction, TControllersSnapshot>>;
};

export interface EngineDefinitionHydrateOptionsWithProps<
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction> {
  controllers: TControllersProps;
}

export type HydrateInitialStateWithProps<
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
> extends FetchInitialStateWithProps<
      InferControllerSnapshotsMapFromDefinitions<TControllers>,
      AnyAction,
      TControllerProps
    >,
    HydrateInitialStateWithProps<
      TEngine,
      InferControllersMapFromDefinition<TControllers>,
      AnyAction,
      TControllerProps
    >,
    BuildWithProps<
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

/**
 * @internal
 */
export type InferHydrationResult<
  T extends EngineDefinition<
    CoreEngine,
    ControllerDefinitionsMap<CoreEngine, Controller>,
    // TODO: Replace with a specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >
> = T extends EngineDefinition<infer TEngine, infer TControllers, infer _>
  ? EngineAndControllers<
      TEngine,
      InferControllersMapFromDefinition<TControllers>
    >
  : never;

export interface ControllerSnapshot<TState> {
  initialState: TState;
}

export interface ControllerSnapshotsMap {
  [customName: string]: ControllerSnapshot<unknown>;
}

export interface EngineSnapshot<
  TSearchFulfilledAction extends AnyAction,
  TControllers extends ControllerSnapshotsMap
> {
  searchFulfilledAction: TSearchFulfilledAction;
  controllers: TControllers;
}

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

/**
 * @internal
 *
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 * @returns Three utility functions to fetch engine snapshot in SSR, hydrate the snapshot in CSR
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
        EngineSnapshot<
          {type: string},
          InferControllerSnapshotsMapFromDefinitions<TControllerDefinitions>
        >
        // eslint-disable-next-line no-async-promise-executor
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
