import {
  Controller,
  SearchEngine,
  ControllerDefinitionsMap,
  SearchEngineDefinitionOptions,
  defineSearchEngine as defineBaseSearchEngine,
  SearchEngineOptions,
} from '@coveo/headless/ssr';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {ContextState, ReactEngineDefinition} from './types.js';
import {singleton} from '../utils.js';
import {
  buildControllerHooks,
  buildEngineHook,
  buildHydratedStateProvider,
  buildStaticStateProvider,
} from './common.js';

export type ReactSearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
> = ReactEngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
export function createSingletonContext<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
>() {
  return singleton(() =>
    React.createContext<ContextState<SearchEngine, TControllers> | null>(null)
  );
}

/**
 * @internal
 * Returns controller hooks and SSR, CSR context providers that can be used to interact with a search engine
 *  in the server and client side respectively.
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
    StaticStateProvider: buildStaticStateProvider(singletonContext),
    HydratedStateProvider: buildHydratedStateProvider(singletonContext),
  };
}
