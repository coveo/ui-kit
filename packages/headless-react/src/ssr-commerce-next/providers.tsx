'use client';

import type {
  Controller,
  ControllerDefinitionsMap,
  EngineStaticState,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferHydratedState,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
import {type PropsWithChildren, useEffect, useState} from 'react';
import type {ReactCommerceEngineDefinition} from './commerce-engine.js';

type UnknownAction = {type: string};

/**
 * Providers take care of displaying your page with the static
 * state, and then hydrating the state and displaying the page
 * with the hydrated state. They are required for your controller hooks to function.
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
    staticState: EngineStaticState<
      UnknownAction,
      InferControllerStaticStateMapFromDefinitionsWithSolutionType<
        TControllers,
        TSolutionType
      >
    >;
  }>) {
    const [hydratedState, setHydratedState] = useState<
      InferHydratedState<typeof definition> | undefined
    >(undefined);

    useEffect(() => {
      definition
        // @ts-expect-error: TODO: KIT-4754: get rid of the OptionTuple type
        .hydrateStaticState(staticState)
        .then(({engine, controllers}) => {
          setHydratedState({
            engine,
            controllers,
          });
        });
    }, [staticState, definition]);

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
