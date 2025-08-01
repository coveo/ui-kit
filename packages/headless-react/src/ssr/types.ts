import type {
  Controller,
  ControllerDefinitionsMap,
  CoreEngine,
  EngineDefinition,
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from '@coveo/headless/ssr';
import type {FunctionComponent, PropsWithChildren} from 'react';

type ContextStaticState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> = {controllers: InferControllerStaticStateMapFromDefinitions<TControllers>};

export type ContextHydratedState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> = {
  engine: TEngine;
  controllers: InferControllersMapFromDefinition<TControllers>;
};

export type ContextState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> =
  | ContextStaticState<TEngine, TControllers>
  | ContextHydratedState<TEngine, TControllers>;

export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>,
> = {
  [K in keyof TControllers as `use${Capitalize<
    K extends string ? K : never
  >}`]: ControllerHook<InferControllerFromDefinition<TControllers[K]>>;
};

export type ReactEngineDefinition<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
> = EngineDefinition<TEngine, TControllers, TEngineOptions> & {
  controllers: InferControllerHooksMapFromDefinition<TControllers>;
  useEngine(): TEngine | undefined;
  /**
   * @deprecated Use `StateProvider` instead.
   */
  StaticStateProvider: FunctionComponent<
    PropsWithChildren<{
      controllers: InferControllerStaticStateMapFromDefinitions<TControllers>;
    }>
  >;
  /**
   * @deprecated Use `StateProvider` instead.
   */
  HydratedStateProvider: FunctionComponent<
    PropsWithChildren<{
      engine: TEngine;
      controllers: InferControllersMapFromDefinition<TControllers>;
    }>
  >;
  StateProvider: FunctionComponent<
    PropsWithChildren<{
      engine?: TEngine;
      controllers:
        | InferControllersMapFromDefinition<TControllers>
        | InferControllerStaticStateMapFromDefinitions<TControllers>;
    }>
  >;
};
