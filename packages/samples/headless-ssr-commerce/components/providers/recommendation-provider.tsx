'use client';

import {
  recommendationEngineDefinition,
  RecommendationHydratedState,
  RecommendationStaticState,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface RecommendationProviderProps {
  staticState: RecommendationStaticState;
  navigatorContext: NavigatorContext;
}

export default function RecommendationProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<RecommendationProviderProps>) {
  const [hydratedState, setHydratedState] = useState<
    RecommendationHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
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
