import {
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  EngineDefinition,
  SolutionType,
  CoreEngineNext,
} from '@coveo/headless/ssr-commerce';
import {FunctionComponent, PropsWithChildren} from 'react';

export type ContextStaticState<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
> = {
  controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
    TControllers,
    TSolutionType
  >;
};

export type ContextHydratedState<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
> = {
  engine: TEngine;
  controllers: InferControllersMapFromDefinition<TControllers, TSolutionType>;
};

export type ContextState<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
> =
  | ContextStaticState<TEngine, TControllers, TSolutionType>
  | ContextHydratedState<TEngine, TControllers, TSolutionType>;

export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  controller?: Omit<TController, 'state' | 'subscribe'>;
};

export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<CoreEngineNext, Controller>,
> = {
  [K in keyof TControllers as `use${Capitalize<
    K extends string ? K : never
  >}`]: ControllerHook<InferControllerFromDefinition<TControllers[K]>>;
};

export type ReactEngineDefinition<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
  TSolutionType extends SolutionType,
> = EngineDefinition<TEngine, TControllers, TEngineOptions, TSolutionType> & {
  controllers: InferControllerHooksMapFromDefinition<TControllers>;
  useEngine(): TEngine | undefined;
  StaticStateProvider: FunctionComponent<
    PropsWithChildren<{
      controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
        TControllers,
        TSolutionType
      >;
    }>
  >;
  HydratedStateProvider: FunctionComponent<
    PropsWithChildren<{
      engine: TEngine;
      controllers: InferControllersMapFromDefinition<
        TControllers,
        TSolutionType
      >;
    }>
  >;
};
