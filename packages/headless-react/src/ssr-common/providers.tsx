'use client';

import {type ComponentType, type PropsWithChildren, useEffect, useState} from 'react';
import type {StateProviderProps} from './hooks.js';

/**
 * @internal
 */
export interface HydratableDefinition<
  TStaticState extends {controllers: object},
  THydratedState extends {engine: unknown; controllers: object},
> {
  hydrateStaticState: (staticState: TStaticState) => Promise<THydratedState>;
  StateProvider: ComponentType<PropsWithChildren<StateProviderProps>>;
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
export function buildProviderWithDefinition<
  TStaticState extends {controllers: object},
  THydratedState extends {engine: unknown; controllers: object},
>(definition: HydratableDefinition<TStaticState, THydratedState>) {
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
        controllers={
          (hydratedState?.controllers ??
            staticState.controllers) as StateProviderProps['controllers']
        }
        hydrationError={hydrationError}
      >
        {children}
      </StateProvider>
    );
  };
}
