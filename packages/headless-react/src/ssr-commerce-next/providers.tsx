'use client';

import type {
  Controller,
  ControllerDefinitionsMap,
  InferHydratedState,
  InferStaticState,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
import {type PropsWithChildren, useEffect, useState} from 'react';
import type {ReactCommerceEngineDefinition} from './commerce-engine.js';

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
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(definition: ReactCommerceEngineDefinition<TControllers, TSolutionType>) {
  return function WrappedProvider({
    staticState,
    children,
  }: PropsWithChildren<{
    /**
     * The static state returned by this definition's `fetchStaticState()`.
     */
    staticState: InferStaticState<typeof definition>;
  }>) {
    const [hydratedState, setHydratedState] = useState<
      InferHydratedState<typeof definition> | undefined
    >(undefined);
    const [hydrationError, setHydrationError] = useState<unknown>(undefined);

    useEffect(() => {
      let superseded = false;

      definition.hydrateStaticState(staticState).then(
        ({engine, controllers}) => {
          if (!superseded) {
            setHydratedState({engine, controllers});
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

    if (hydrationError !== undefined) {
      throw hydrationError;
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
