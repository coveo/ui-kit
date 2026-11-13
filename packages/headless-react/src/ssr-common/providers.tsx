'use client';

import type {EngineDefinition} from '@coveo/headless/ssr-next';
import {
  type ComponentType,
  type FunctionComponent,
  type PropsWithChildren,
  useEffect,
  useRef,
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
 * @typeParam TStaticState - The static state of the engine definition.
 *
 * @group Providers
 */
export interface ProviderProps<TStaticState> {
  /**
   * The static state returned by the engine definition's `fetchStaticState()`.
   */
  staticState: TStaticState;
  /**
   * Called once when the hydration of a static state fails. The components then keep rendering the
   * static state and `useHydration()` reports the error. Without this option, the error is thrown
   * during render so the nearest React error boundary reports it.
   *
   * A function cannot cross from a server component to a client component, so pass this option where
   * the provider is rendered from a client component.
   */
  onHydrationError?: (error: unknown) => void;
}

/**
 * Builds the provider of an engine definition: it renders the static state fetched on the server,
 * hydrates it in the browser, and makes the controller hooks work.
 *
 * A hydration failure is thrown during render, so the nearest React error boundary reports it,
 * unless the `onHydrationError` prop handles it.
 *
 * See [Create providers](https://docs.coveo.com/en/obif0156/#create-providers).
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
  return function WrappedProvider({staticState, onHydrationError, children}) {
    const [hydratedState, setHydratedState] = useState<THydratedState | undefined>(undefined);
    const [failure, setFailure] = useState<{staticState: TStaticState; error: unknown}>();
    const hydrationFailure = failure?.staticState === staticState ? failure : undefined;
    const onHydrationErrorRef = useRef(onHydrationError);

    useEffect(() => {
      onHydrationErrorRef.current = onHydrationError;
    });

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
            setFailure({staticState, error});
          }
        }
      );

      return () => {
        superseded = true;
      };
    }, [staticState]);

    useEffect(() => {
      if (hydrationFailure) {
        onHydrationErrorRef.current?.(hydrationFailure.error);
      }
    }, [hydrationFailure]);

    if (hydrationFailure && !onHydrationError) {
      throw hydrationFailure.error;
    }

    return (
      <definition.StateProvider
        engine={hydratedState?.engine}
        controllers={hydratedState?.controllers || staticState.controllers}
        hydrationFailure={hydrationFailure}
      >
        {children}
      </definition.StateProvider>
    );
  };
}
