import type {
  CommerceEngineDefinition,
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
  SolutionType,
  CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce-next';
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
  TSolutionType extends SolutionType,
> = CommerceEngineDefinition<TControllers, TSolutionType> & {
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
