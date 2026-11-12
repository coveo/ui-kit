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

export type {Hydration, HydrationStatus} from '../ssr-common/types.js';

export type ContextState<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  engine?: SSRCommerceEngine;
  controllers:
    | InferControllersMapFromDefinition<TControllers, TSolutionType>
    | InferControllerStaticStateMapFromDefinitionsWithSolutionType<TControllers, TSolutionType>;
  solutionType: TSolutionType;
  hydrationError?: unknown;
};

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

export type ReactEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = CommerceEngineDefinition<TControllers, TSolutionType> & {
  StateProvider: FunctionComponent<
    PropsWithChildren<{
      engine?: SSRCommerceEngine;
      controllers:
        | InferControllersMapFromDefinition<TControllers, TSolutionType>
        | InferControllerStaticStateMapFromDefinitionsWithSolutionType<TControllers, TSolutionType>;
      /**
       * @internal Set by the provider built with `buildProviderWithDefinition()` when the hydration fails.
       */
      hydrationError?: unknown;
    }>
  >;
};
