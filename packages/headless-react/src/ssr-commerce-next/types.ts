import type {
  CommerceEngineDefinition,
  CommerceHydratedState,
  CommerceStaticState,
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  SolutionType,
  CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce-next';
import type {FunctionComponent, PropsWithChildren} from 'react';

export type ContextHydratedState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  engine: SSRCommerceEngine;
  controllers: CommerceHydratedState<TControllers, TSolutionType>['controllers'];
  solutionType: TSolutionType;
};

export type ContextState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  engine?: SSRCommerceEngine;
  controllers:
    | CommerceHydratedState<TControllers, TSolutionType>['controllers']
    | CommerceStaticState<TControllers, TSolutionType>['controllers'];
  solutionType: TSolutionType;
};

export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = {
  [K in keyof TControllers as `use${Capitalize<K extends string ? K : never>}`]: ControllerHook<
    InferControllerFromDefinition<TControllers[K]>
  >;
};

export type ReactEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = CommerceEngineDefinition<TControllers, TSolutionType> & {
  StateProvider: FunctionComponent<
    PropsWithChildren<
      StateProviderProps<
        CommerceStaticState<TControllers, TSolutionType>,
        CommerceHydratedState<TControllers, TSolutionType>
      >
    >
  >;
};

/**
 * The props of the `StateProvider` of an engine definition: the controllers that its hooks read (their
 * static state, or the live controllers once hydrated) and the hydrated engine.
 *
 * @typeParam TStaticState - The static state of the engine definition.
 * @typeParam THydratedState - The hydrated state of the engine definition.
 */
export type StateProviderProps<
  TStaticState extends {controllers: object},
  THydratedState extends {engine: unknown; controllers: object},
> = {
  engine?: THydratedState['engine'];
  controllers: TStaticState['controllers'] | THydratedState['controllers'];
};
