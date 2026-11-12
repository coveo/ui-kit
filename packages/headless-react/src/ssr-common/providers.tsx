'use client';

import type {EngineDefinition} from '@coveo/headless/ssr-next';
import {
  type ComponentType,
  type FunctionComponent,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import type {StateProviderProps} from './types.js';

/**
 * What a provider needs from an engine definition: how to hydrate its static state, and the
 * `StateProvider` that hands the controllers to the hooks.
 *
 * @typeParam TStaticState - The static state of the engine definition.
 * @typeParam THydratedState - The hydrated state of the engine definition.
 *
 * @group Providers
 */
export interface HydratableDefinition<
  TStaticState extends {controllers: object},
  THydratedState extends {engine: unknown; controllers: object},
> extends Pick<EngineDefinition<TStaticState, THydratedState>, 'hydrateStaticState'> {
  StateProvider: ComponentType<PropsWithChildren<StateProviderProps<TStaticState, THydratedState>>>;
}

/**
 * The props of the provider built by `buildProviderWithDefinition()`.
 *
 * @group Providers
 */
export interface ProviderProps<TStaticState> {
  /**
   * The static state returned by the engine definition's `fetchStaticState()`.
   */
  staticState: TStaticState;
  /**
   * Called when the hydration fails. The components then keep rendering the static state and
   * `useHydration()` reports the error. Without this option, the error is thrown during render so the
   * nearest React error boundary reports it.
   */
  onHydrationError?: (error: unknown) => void;
}

/**
 * @internal
 */
/**
 * Builds the provider of an engine definition: it renders the static state fetched on the server,
 * hydrates it in the browser, and makes the controller hooks work.
 *
 * A hydration failure is thrown during render, so the nearest React error boundary reports it,
 * unless the `onHydrationError` prop handles it.
 *
 * @example
 * ```tsx
 * // components/providers.tsx
 * 'use client';
 * export const SearchProvider = buildProviderWithDefinition(searchEngineDefinition);
 *
 * // app/search/page.tsx (server component)
 * const staticState = await searchEngineDefinition.fetchStaticState({navigatorContext, searchParams});
 * return <SearchProvider staticState={staticState}>...</SearchProvider>;
 * ```
 *
 * @param definition - The engine definition to build the provider for.
 * @returns The provider component. Its `staticState` prop takes the static state that the same
 *  engine definition fetched.
 *
 * @group Providers
 */
export function buildProviderWithDefinition<
  TStaticState extends {controllers: object},
  THydratedState extends {engine: unknown; controllers: object},
>(
  definition: HydratableDefinition<TStaticState, THydratedState>
): FunctionComponent<PropsWithChildren<ProviderProps<TStaticState>>> {
  return function WrappedProvider({
    staticState,
    onHydrationError,
    children,
  }: PropsWithChildren<ProviderProps<TStaticState>>) {
    const [hydratedState, setHydratedState] = useState<THydratedState | undefined>(undefined);
    const [hydrationError, setHydrationError] = useState<unknown>(undefined);

    useEffect(() => {
      let superseded = false;

      definition.hydrateStaticState(staticState).then(
        (result) => {
          if (!superseded) {
            setHydratedState(result);
          }
        },
        (error: unknown) => {
          if (!superseded) {
            setHydrationError(error);
          }
        }
      );

      return () => {
        superseded = true;
      };
    }, [staticState]);

    useEffect(() => {
      if (hydrationError !== undefined) {
        onHydrationError?.(hydrationError);
      }
    }, [hydrationError, onHydrationError]);

    if (hydrationError !== undefined && !onHydrationError) {
      throw hydrationError;
    }

    const StateProvider = definition.StateProvider;
    return (
      <StateProvider
        engine={hydratedState?.engine}
        controllers={hydratedState?.controllers ?? staticState.controllers}
        hydrationError={hydrationError}
      >
        {children}
      </StateProvider>
    );
  };
}
