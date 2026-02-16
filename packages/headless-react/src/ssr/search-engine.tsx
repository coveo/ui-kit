import {
  type Controller,
  type ControllerDefinitionsMap,
  defineSearchEngine as defineBaseSearchEngine,
  type SearchEngine,
  type SearchEngineDefinitionOptions,
  type SearchEngineOptions,
} from '@coveo/headless/ssr';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {singleton} from '../utils.js';
import {
  buildControllerHooks,
  buildEngineHook,
  buildHydratedStateProvider,
  buildStateProvider,
  buildStaticStateProvider,
} from './common.js';
import type {ContextState, ReactEngineDefinition} from './types.js';

export type ReactSearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
> = ReactEngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

// TODO: remove hack: KIT-5009
// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
function createSingletonContext<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
>() {
  return singleton(() =>
    React.createContext<ContextState<SearchEngine, TControllers> | null>(null)
  );
}

/**
 * Returns controller hooks as well as SSR and CSR context providers that can be used to interact with a search engine
 *  on the server and client side respectively.
 */
export function defineSearchEngine<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
>(
  options: SearchEngineDefinitionOptions<TControllers>
): ReactSearchEngineDefinition<TControllers> {
  const singletonContext = createSingletonContext<TControllers>();
  return {
    ...defineBaseSearchEngine({...options}),
    useEngine: buildEngineHook(singletonContext),
    controllers: buildControllerHooks(singletonContext, options.controllers),
    /**
     * @deprecated Use `StateProvider` instead.
     */
    StaticStateProvider: buildStaticStateProvider(singletonContext),
    /**
     * @deprecated Use `StateProvider` instead.
     */
    HydratedStateProvider: buildHydratedStateProvider(singletonContext),
    StateProvider: buildStateProvider(singletonContext),
  };
}
