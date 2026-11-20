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

export type {ControllerHook, Hydration, HydrationStatus} from '../ssr-common/types.js';

/**
 * The hooks of an engine definition: one `use<Name>` hook per controller.
 *
 * @group Hooks
 */
export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = {
  [K in keyof TControllers as `use${Capitalize<K extends string ? K : never>}`]: ControllerHook<
    InferControllerFromDefinition<TControllers[K]>
  >;
};

/**
 * A commerce engine definition with the React `StateProvider` of its hooks.
 *
 * @group Engine
 */
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
