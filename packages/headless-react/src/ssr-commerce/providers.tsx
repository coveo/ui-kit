'use client';

import {
  HydrateStaticStateOptions,
  InferHydratedState,
  InferStaticState,
  NavigatorContext,
} from '@coveo/headless/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';
import {defineCommerceEngine} from './commerce-engine.js';

interface WithDefinitionProps {
  staticState: InferStaticState<RealDefinition>;
  navigatorContext: NavigatorContext;
}

type LooseDefinition = {
  setNavigatorContextProvider: unknown;
  build: unknown;
  hydrateStaticState: unknown;
  fetchStaticState: unknown;
  HydratedStateProvider: unknown;
  StaticStateProvider: unknown;
};

type RealDefinition =
  | ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
  | ReturnType<typeof defineCommerceEngine>['listingEngineDefinition']
  | ReturnType<typeof defineCommerceEngine>['searchEngineDefinition']
  | ReturnType<typeof defineCommerceEngine>['standaloneEngineDefinition'];

export function buildProviderWithDefinition(looseDefinition: LooseDefinition) {
  return function WrappedProvider({
    staticState,
    navigatorContext,
    children,
  }: PropsWithChildren<WithDefinitionProps>) {
    const definition = looseDefinition as RealDefinition;
    type RecommendationHydratedState = InferHydratedState<typeof definition>;
    const [hydratedState, setHydratedState] = useState<
      RecommendationHydratedState | undefined
    >(undefined);

    definition.setNavigatorContextProvider(() => navigatorContext);

    useEffect(() => {
      const {searchActions, controllers} = staticState;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hydrateControllers: Record<string, any> = {};

      if ('parameterManager' in controllers) {
        hydrateControllers.parameterManager = {
          initialState: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameters: (controllers as any).parameterManager.state.parameters,
          },
        };
      }

      if ('cart' in controllers) {
        hydrateControllers.cart = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialState: {items: (controllers as any).cart.state.items},
        };
      }

      if ('context' in controllers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hydrateControllers.context = (controllers as any).context.state;
      }

      definition
        .hydrateStaticState({
          searchActions,
          controllers: {
            ...controllers,
            ...hydrateControllers,
          },
        } as HydrateStaticStateOptions<{type: string}>)
        .then(({engine, controllers}) => {
          setHydratedState({engine, controllers});
        });
    }, [staticState]);

    if (hydratedState) {
      return (
        <definition.HydratedStateProvider
          engine={hydratedState.engine}
          controllers={hydratedState.controllers}
        >
          {children}
        </definition.HydratedStateProvider>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StaticStateProviderWithAnyControllers = (looseDefinition as any)
      .StaticStateProvider as React.ComponentType<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      controllers: any;
      children: React.ReactNode;
    }>;

    return (
      <StaticStateProviderWithAnyControllers
        controllers={staticState.controllers}
      >
        {children}
      </StaticStateProviderWithAnyControllers>
    );
  };
}
