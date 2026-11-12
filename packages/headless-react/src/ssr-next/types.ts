import type {
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  SearchEngine,
  SearchEngineDefinition,
  SearchHydratedState,
  SearchStaticState,
} from '@coveo/headless/ssr-next';
import type {FunctionComponent, PropsWithChildren} from 'react';
import type {StateProviderProps} from '../ssr-common/types.js';

export type {Hydration, HydrationStatus} from '../ssr-common/types.js';

export type SearchControllerDefinitionsMap = ControllerDefinitionsMap<SearchEngine, Controller>;

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
 * hook is `useSearchContext` so that it does not shadow React's own `useContext`.
 */
type ControllerHookName<K> = K extends 'context'
  ? 'useSearchContext'
  : `use${Capitalize<K extends string ? K : never>}`;

/**
 * The hooks of an engine definition: one `use<Name>` hook per controller, with `useSearchContext`
 * for the built-in `context` controller.
 *
 * @group Hooks
 */
export type InferControllerHooksMapFromDefinition<
  TControllers extends SearchControllerDefinitionsMap,
> = {
  [K in keyof TControllers as ControllerHookName<K>]: ControllerHook<
    InferControllerFromDefinition<TControllers[K]>
  >;
};

/**
 * A search engine definition with the React `StateProvider` of its hooks.
 *
 * @group Engine
 */
export type ReactSearchEngineDefinition<TControllers extends SearchControllerDefinitionsMap> =
  SearchEngineDefinition<TControllers> & {
    StateProvider: FunctionComponent<
      PropsWithChildren<
        StateProviderProps<SearchStaticState<TControllers>, SearchHydratedState<TControllers>>
      >
    >;
  };
