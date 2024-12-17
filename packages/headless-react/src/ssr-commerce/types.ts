import {
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  EngineDefinition,
  SolutionType,
  CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce';
import {FunctionComponent, PropsWithChildren} from 'react';

export type ContextStaticState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
    TControllers,
    TSolutionType
  >;
  solutionType: TSolutionType;
};

export type ContextHydratedState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  engine: SSRCommerceEngine;
  controllers: InferControllersMapFromDefinition<TControllers, TSolutionType>;
  solutionType: TSolutionType;
};

export type ContextState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> =
  | ContextStaticState<TControllers, TSolutionType>
  | ContextHydratedState<TControllers, TSolutionType>;

export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = {
  [K in keyof TControllers as `use${Capitalize<
    K extends string ? K : never
  >}`]: ControllerHook<InferControllerFromDefinition<TControllers[K]>>;
};

export type ReactEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TEngineOptions,
  TSolutionType extends SolutionType,
> = EngineDefinition<TControllers, TEngineOptions, TSolutionType> & {
  controllers: InferControllerHooksMapFromDefinition<TControllers>;
  useEngine(): SSRCommerceEngine | undefined;
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
      engine: SSRCommerceEngine;
      controllers: InferControllersMapFromDefinition<
        TControllers,
        TSolutionType
      >;
    }>
  >;
};
