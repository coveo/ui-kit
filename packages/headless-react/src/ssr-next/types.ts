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
import type {ControllerHook, StateProviderProps} from '../ssr-common/types.js';

export type {ControllerHook, Hydration, HydrationStatus} from '../ssr-common/types.js';

export type SearchControllerDefinitionsMap = ControllerDefinitionsMap<SearchEngine, Controller>;

/**
 * The hooks of an engine definition: one `use<Name>` hook per controller.
 *
 * @group Hooks
 */
export type InferControllerHooksMapFromDefinition<
  TControllers extends SearchControllerDefinitionsMap,
> = {
  [K in keyof TControllers as `use${Capitalize<K extends string ? K : never>}`]: ControllerHook<
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
