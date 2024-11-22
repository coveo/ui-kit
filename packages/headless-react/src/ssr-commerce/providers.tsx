'use client';

import {
  InferHydratedState,
  InferStaticState,
  NavigatorContext,
} from '@coveo/headless/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';
import {defineCommerceEngine} from './commerce-engine.js';

interface RecommendationProviderProps {
  recommendationEngineDefinition: ReturnType<
    typeof defineCommerceEngine
  >['recommendationEngineDefinition'];
  staticState: InferStaticState<
    ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
  >;
  navigatorContext: NavigatorContext;
}

function RecommendationProvider({
  recommendationEngineDefinition,
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<RecommendationProviderProps>) {
  type RecommendationHydratedState = InferHydratedState<
    typeof recommendationEngineDefinition
  >;
  const [hydratedState, setHydratedState] = useState<
    RecommendationHydratedState | undefined
  >(undefined);

  recommendationEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  useEffect(() => {
    recommendationEngineDefinition
      .hydrateStaticState({
        searchActions: staticState.searchActions,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  if (hydratedState) {
    return (
      <recommendationEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
      </recommendationEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <recommendationEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {children}
      </recommendationEngineDefinition.StaticStateProvider>
    );
  }
}

interface WithRecommendationProps {
  staticState: InferStaticState<
    ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
  >;
  navigatorContext: NavigatorContext;
}

export function ProviderWithRecommendation(
  recommendationEngineDefinition: unknown
) {
  return function WrappedRecommendationProvider({
    staticState,
    navigatorContext,
    children,
  }: PropsWithChildren<WithRecommendationProps>) {
    const castedDefinition = recommendationEngineDefinition as ReturnType<
      typeof defineCommerceEngine
    >['recommendationEngineDefinition'];

    return (
      <RecommendationProvider
        recommendationEngineDefinition={castedDefinition}
        staticState={staticState}
        navigatorContext={navigatorContext}
      >
        {children}
      </RecommendationProvider>
    );
  };
}

interface ListingProviderProps {
  listingEngineDefinition: unknown;
  staticState: InferStaticState<
    ReturnType<typeof defineCommerceEngine>['listingEngineDefinition']
  >;
  navigatorContext: NavigatorContext;
}

function ListingProvider({
  listingEngineDefinition,
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<ListingProviderProps>) {
  const definition = listingEngineDefinition as good;

  type good = ReturnType<
    typeof defineCommerceEngine
  >['listingEngineDefinition'];

  type RecommendationHydratedState = InferHydratedState<typeof definition>;
  const [hydratedState, setHydratedState] = useState<
    RecommendationHydratedState | undefined
  >(undefined);

  definition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    definition
      .hydrateStaticState({
        searchActions: staticState.searchActions,
        controllers: staticState.controllers,
      })
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
  } else {
    return (
      <definition.StaticStateProvider controllers={staticState.controllers}>
        {children}
      </definition.StaticStateProvider>
    );
  }
}

interface WithListingProps {
  staticState: InferStaticState<
    ReturnType<typeof defineCommerceEngine>['listingEngineDefinition']
  >;
  navigatorContext: NavigatorContext;
}

export function ProviderWithListing(listingEngineDefinition: unknown) {
  return function WrappedRecommendationProvider({
    staticState,
    navigatorContext,
    children,
  }: PropsWithChildren<WithListingProps>) {
    return (
      <ListingProvider
        listingEngineDefinition={listingEngineDefinition}
        staticState={staticState}
        navigatorContext={navigatorContext}
      >
        {children}
      </ListingProvider>
    );
  };
}

interface ProviderProps {
  definition:
    | ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
    | ReturnType<typeof defineCommerceEngine>['listingEngineDefinition']
    | ReturnType<typeof defineCommerceEngine>['searchEngineDefinition']
    | ReturnType<typeof defineCommerceEngine>['standaloneEngineDefinition'];
  staticState: InferStaticState<
    ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
  >;
  navigatorContext: NavigatorContext;
}

// Build a agnostic provider
// keep the same exact code except for the useEffect
// figure out the useEffect in another function
// this function will have to understand whether the engine is listing, recommendation, search or standalone.
function Provider({
  definition,
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<ProviderProps>) {
  type RecommendationHydratedState = InferHydratedState<typeof definition>;
  const [hydratedState, setHydratedState] = useState<
    RecommendationHydratedState | undefined
  >(undefined);

  definition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    definition
      .hydrateStaticState({
        searchActions: staticState.searchActions,

        controllers: staticState.controllers,
      })
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
  } else {
    return (
      <definition.StaticStateProvider controllers={staticState.controllers}>
        {children}
      </definition.StaticStateProvider>
    );
  }
}

export function buildProviderWithDefinition(
  definition:
    | ReturnType<typeof defineCommerceEngine>['recommendationEngineDefinition']
    | ReturnType<typeof defineCommerceEngine>['listingEngineDefinition']
    | ReturnType<typeof defineCommerceEngine>['searchEngineDefinition']
    | ReturnType<typeof defineCommerceEngine>['standaloneEngineDefinition']
) {
  return function WrappedProvider({
    staticState,
    navigatorContext,
    children,
  }: PropsWithChildren<WithListingProps>) {
    return (
      <Provider
        definition={definition}
        staticState={staticState}
        navigatorContext={navigatorContext}
      >
        {children}
      </Provider>
    );
  };
}
