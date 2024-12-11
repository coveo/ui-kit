'use client';

import {
  ArrayValue,
  NumberValue,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {
  CartItem,
  CartState,
  ContextState,
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

      const hydrateControllers: Record<string, object> = {};

      const cartKey = findCartKey(controllers);

      if (cartKey) {
        hydrateControllers[cartKey] = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialState: {items: (controllers as any)[cartKey].state.items},
        };
      }

      const contextKey = findContextKey(controllers);
      if (contextKey) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hydrateControllers[contextKey] = (controllers as any)[contextKey].state;
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

function findCartKey(controllers: {}) {
  const cartStateSchema = new Schema<CartState>({
    items: new ArrayValue<CartItem>({
      required: true,
      each: new RecordValue({
        values: {
          productId: new StringValue({required: true}),
          name: new StringValue({required: true}),
          price: new NumberValue({required: true}),
          quantity: new NumberValue({required: true}),
        },
      }),
    }),
    totalQuantity: new NumberValue({required: true}),
    totalPrice: new NumberValue({required: true}),
  });

  return findKeyBySchema(controllers, cartStateSchema);
}

function findContextKey(controllers: {}) {
  const contextStateSchema = new Schema<ContextState>({
    language: new StringValue({required: true}),
    country: new StringValue({required: true}),
    currency: new StringValue({required: true}),
    location: new RecordValue({
      values: {
        latitude: new NumberValue({required: true}),
        longitude: new NumberValue({required: true}),
      },
    }),
    view: new RecordValue({
      values: {
        url: new StringValue({required: true}),
      },
    }),
  });

  return findKeyBySchema(controllers, contextStateSchema);
}

function findKeyBySchema<T extends object>(
  controllers: {},
  schema: Schema<T>
): string | undefined {
  return Object.keys(controllers).find((key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controller = (controllers as any)[key];
    try {
      schema.validate(controller?.state);
      return true;
    } catch (_) {
      return false;
    }
  });
}
