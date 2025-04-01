import {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {CoreEngine, CoreEngineNext} from '../../engine.js';

export type HasKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K] extends never
      ? never
      : true
    : never
  : never;

export type HasKeys<TObject> = TObject extends {}
  ? keyof TObject extends never
    ? false
    : true
  : boolean;

export type HasRequiredKeys<TObject> = TObject extends {}
  ? {
      [K in keyof TObject]-?: {} extends Pick<TObject, K> ? never : K;
    }[keyof TObject] extends never
    ? false
    : true
  : boolean;

export type HasOptionalKeys<TObject> = TObject extends {}
  ? {
      [K in keyof TObject]-?: {} extends Pick<TObject, K> ? K : never;
    }[keyof TObject] extends never
    ? false
    : true
  : boolean;

export type ExtractRequiredOptions<TOptions> = {
  [TKey in keyof TOptions as Pick<TOptions, TKey> extends Required<
    Pick<TOptions, TKey>
  >
    ? TKey
    : never]: TOptions[TKey];
};

export type OptionsTuple<TOptions> =
  HasKeys<TOptions> extends false
    ? []
    : HasKeys<ExtractRequiredOptions<TOptions>> extends false
      ? [options?: TOptions]
      : [options: TOptions];

export interface OptionsExtender<TOptions> {
  (options: TOptions): TOptions | Promise<TOptions>;
}

export interface ControllersPropsMap {
  [customName: string]: unknown;
}

export interface ControllersMap {
  [customName: string]: Controller;
}

export interface ControllerStaticState<TState> {
  state: TState;
}

export interface ControllerStaticStateMap {
  [customName: string]: ControllerStaticState<unknown>;
}

export interface ControllerDefinitionWithoutProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @returns The controller.
   */
  build(engine: TEngine): TController;
}

export interface ControllerDefinitionWithProps<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
  TProps,
> {
  /**
   * Creates an instance of the given controller.
   *
   * @param engine - The search engine.
   * @param props - The controller properties.
   * @returns The controller.
   */
  buildWithProps(engine: TEngine, props?: TProps): TController;
}

export type ControllerDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> =
  | ControllerDefinitionWithoutProps<TEngine, TController>
  | ControllerDefinitionWithProps<TEngine, TController, unknown>;

export interface ControllerDefinitionsMap<
  TEngine extends CoreEngine | CoreEngineNext,
  TController extends Controller,
> {
  [customName: string]: ControllerDefinition<TEngine, TController>;
}

export interface EngineDefinitionBuildResult<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> {
  engine: TEngine;
  controllers: TControllers;
}

export interface EngineStaticState<
  TSearchAction extends UnknownAction,
  TControllers extends ControllerStaticStateMap,
> {
  searchAction: TSearchAction;
  controllers: TControllers;
}

export interface HydratedState<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllersMap,
> extends EngineDefinitionBuildResult<TEngine, TControllers> {}

export type InferControllerPropsFromDefinition<
  TController extends ControllerDefinition<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> =
  TController extends ControllerDefinitionWithProps<
    CoreEngine | CoreEngineNext,
    Controller,
    infer Props
  >
    ? Props
    : TController extends ControllerDefinitionWithoutProps<
          CoreEngine | CoreEngineNext,
          Controller
        >
      ? {}
      : unknown;

export type InferControllerPropsMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = {
  [K in keyof TControllers as HasKeys<
    InferControllerPropsFromDefinition<TControllers[K]>
  > extends false
    ? never
    : K]: InferControllerPropsFromDefinition<TControllers[K]>;
};

export type InferControllerFromDefinition<
  TDefinition extends ControllerDefinition<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> =
  TDefinition extends ControllerDefinition<infer _, infer TController>
    ? TController
    : never;

export type InferControllersMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = {[K in keyof TControllers]: InferControllerFromDefinition<TControllers[K]>};

export type InferControllerStaticStateFromController<
  TController extends Controller,
> = ControllerStaticState<TController['state']>;

export type InferControllerStaticStateMapFromDefinitions<
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = {
  [K in keyof TControllers]: InferControllerStaticStateFromController<
    InferControllerFromDefinition<TControllers[K]>
  >;
};

export type InferControllerStaticStateMapFromControllers<
  TControllers extends ControllersMap,
> = {
  [K in keyof TControllers]: InferControllerStaticStateFromController<
    TControllers[K]
  >;
};

export type EngineDefinitionControllersPropsOption<
  TControllersPropsMap extends ControllersPropsMap,
> =
  HasKeys<TControllersPropsMap> extends false
    ? {}
    : {
        controllers: TControllersPropsMap;
      };
