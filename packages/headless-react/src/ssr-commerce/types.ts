import type {
  Controller,
  ControllerDefinitionsMap,
  EngineDefinition,
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
  SolutionType,
  CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce';
import type {FunctionComponent, PropsWithChildren} from 'react';

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
> = {
  engine?: SSRCommerceEngine;
  controllers:
    | InferControllersMapFromDefinition<TControllers, TSolutionType>
    | InferControllerStaticStateMapFromDefinitionsWithSolutionType<
        TControllers,
        TSolutionType
      >;
  solutionType: TSolutionType;
};

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
  /**
   * @deprecated Use `StateProvider` instead.
   */
  StaticStateProvider: FunctionComponent<
    PropsWithChildren<{
      controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
        TControllers,
        TSolutionType
      >;
    }>
  >;
  /**
   * @deprecated Use `StateProvider` instead.
   */
  HydratedStateProvider: FunctionComponent<
    PropsWithChildren<{
      engine: SSRCommerceEngine;
      controllers: InferControllersMapFromDefinition<
        TControllers,
        TSolutionType
      >;
    }>
  >;
  StateProvider: FunctionComponent<
    PropsWithChildren<{
      engine?: SSRCommerceEngine;
      controllers:
        | InferControllersMapFromDefinition<TControllers, TSolutionType>
        | InferControllerStaticStateMapFromDefinitionsWithSolutionType<
            TControllers,
            TSolutionType
          >;
    }>
  >;
};
