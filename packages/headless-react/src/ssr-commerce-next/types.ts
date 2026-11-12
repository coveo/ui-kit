import type {
  CommerceEngineDefinition,
  CommerceHydratedState,
  CommerceStaticState,
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
import type {FunctionComponent, PropsWithChildren} from 'react';
import type {ControllerHook, StateProviderProps} from '../ssr-common/types.js';

export type {ControllerHook} from '../ssr-common/types.js';

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
