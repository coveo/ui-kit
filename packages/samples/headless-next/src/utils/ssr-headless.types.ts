import {Controller, CoreEngine, EngineConfiguration} from '@coveo/headless';

type AnyAction = {type: string};
type HasKeys<TObject> = TObject extends {}
  ? keyof TObject extends never
    ? false
    : true
  : boolean;

export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = TOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: TControllers;
};

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

export interface EngineSnapshot<
  TSearchFulfilledAction extends AnyAction,
  TControllers extends ControllerSnapshotsMap
> {
  searchFulfilledAction: TSearchFulfilledAction;
  controllers: TControllers;
}

export interface ControllerSnapshot<TState> {
  initialState: TState;
}

export interface ControllerSnapshotsMap {
  [customName: string]: ControllerSnapshot<unknown>;
}

export interface ControllersPropsMap {
  [customName: string]: unknown;
}

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
  executeOnce(
    options: EngineDefinitionExecuteOnceOptions<TControllersProps>
  ): Promise<EngineSnapshot<TSearchFulfilledAction, TControllersSnapshot>>;
};

export type ExecuteOnceFunctionWithoutProps<
  TControllersSnapshot extends ControllerSnapshotsMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  executeOnce(): Promise<
    EngineSnapshot<TSearchFulfilledAction, TControllersSnapshot>
  >;
};

export interface EngineDefinitionHydrateOptionsWithoutProps<
  TSearchFulfilledAction extends AnyAction
> {
  searchFulfilledAction: TSearchFulfilledAction;
}

export interface EngineDefinitionHydrateOptionsWithProps<
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction> {
  controllers: TControllersProps;
}

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
  hydrate(
    options: EngineDefinitionHydrateOptionsWithProps<
      TSearchFulfilledAction,
      TControllersProps
    >
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};

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
  hydrate(
    options: EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction>
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};

export interface EngineDefinitionBuildOptionsWithoutProps<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export interface EngineDefinitionBuildOptionsWithProps<
  TEngineOptions,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionBuildOptionsWithoutProps<TEngineOptions> {
  controllers: TControllersProps;
}

export interface OptionsExtender<TOptions> {
  (options: TOptions): TOptions | Promise<TOptions>;
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

export type InferStateFromEngine<TEngine extends CoreEngine> = TEngine['state'];
export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<CoreEngine, Controller>
> = TDefinition extends ControllerDefinition<infer _, infer TController>
  ? TController
  : never;
export type InferControllerSnapshotsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = {[K in keyof TControllers]: {initialState: TControllers[K]}};
export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = {[K in keyof TControllers]: InferControllerFromDefinition<TControllers[K]>};
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

export type InferExecutionResult<
  T extends EngineDefinition<
    CoreEngine,
    ControllerDefinitionsMap<CoreEngine, Controller>,
    any
  >
> = T extends EngineDefinition<CoreEngine, infer TControllers, infer _>
  ? EngineSnapshot<
      AnyAction,
      InferControllerSnapshotsMapFromDefinitions<TControllers>
    >
  : never;

export type InferHydrationResult<
  T extends EngineDefinition<
    CoreEngine,
    ControllerDefinitionsMap<CoreEngine, Controller>,
    any
  >
> = T extends EngineDefinition<infer TEngine, infer TControllers, infer _>
  ? EngineAndControllers<
      TEngine,
      InferControllersMapFromDefinition<TControllers>
    >
  : never;
