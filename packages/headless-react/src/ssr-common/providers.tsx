'use client';

import type {EngineDefinition} from '@coveo/headless/ssr-next';
import {type ComponentType, type PropsWithChildren, useEffect, useState} from 'react';
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
 * Providers take care of displaying your page with the static
 * state, and then hydrating the state and displaying the page
 * with the hydrated state. They are required for your controller hooks to function.
 *
 * A hydration failure is thrown during render, so the nearest React error boundary reports it.
 *
 * See [Create providers](https://docs.coveo.com/en/obif0156/#create-providers).
 *
 * @group Providers
 */
export function buildProviderWithDefinition<
  TStaticState extends {controllers: object},
  THydratedState extends {engine: unknown; controllers: object},
>(definition: HydratableDefinition<TStaticState, THydratedState>) {
  return function WrappedProvider({
    staticState,
    children,
  }: PropsWithChildren<{
    /**
     * The static state returned by this definition's `fetchStaticState()`.
     */
    staticState: TStaticState;
  }>) {
    const [hydratedState, setHydratedState] = useState<THydratedState | undefined>(undefined);
    const [hydrationError, setHydrationError] = useState<{error: unknown} | undefined>(undefined);

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
            setHydrationError({error});
          }
        }
      );

      return () => {
        superseded = true;
      };
    }, [staticState]);

    if (hydrationError) {
      throw hydrationError.error;
    }

    return (
      <definition.StateProvider
        engine={hydratedState?.engine}
        controllers={hydratedState?.controllers || staticState.controllers}
      >
        {children}
      </definition.StateProvider>
    );
  };
}
