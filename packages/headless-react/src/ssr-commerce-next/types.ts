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
import type {StateProviderProps} from '../ssr-common/types.js';

export type {Hydration, HydrationStatus} from '../ssr-common/types.js';

/**
 * A controller hook: the controller state, and its methods once the engine is hydrated.
 *
 * @group Hooks
 */
export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

/**
 * The name of a controller's hook: `use<Name>`, except for the built-in `context` controller, whose
 * hook is `useCommerceContext` so that it does not shadow React's own `useContext`.
 */
type ControllerHookName<K> = K extends 'context'
  ? 'useCommerceContext'
  : `use${Capitalize<K extends string ? K : never>}`;

/**
 * The hooks of an engine definition: one `use<Name>` hook per controller, with `useCommerceContext`
 * for the built-in `context` controller.
 *
 * @group Hooks
 */
export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
> = {
  [K in keyof TControllers as ControllerHookName<K>]: ControllerHook<
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
