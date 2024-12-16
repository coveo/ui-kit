'use client';

import {
  HydrateStaticStateOptions,
  InferHydratedState,
  InferStaticState,
  NavigatorContext,
  ControllerWithKind,
  Kind,
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

      const hydrateControllers: Record<string, object> = {};

      for (const [key, controller] of Object.entries(controllers)) {
        const typedController = controller as ControllerWithKind;

        switch (typedController._kind) {
          case Kind.Cart:
            hydrateControllers[key] = {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              initialState: {items: (controllers as any)[key].state.items},
            };
            break;

          case Kind.Context:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            hydrateControllers[key] = (controllers as any)[key].state;

            break;

          case Kind.ParameterManager:
            // TODO
            break;

          case Kind.Recommendations:
            // if (
            //   //@ts-expect-error normal
            //   controller.state.productId &&
            //   //@ts-expect-error normal
            //   controller.state.productId !== ''
            // ) {
            //   console.log('controller', controller);
            // }
            // hydrateControllers[key] = {
            //   options: {
            //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
            //     productId: (controllers as any)[key].state.productId,
            //   },
            // };
            break;

          default:
        }
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
