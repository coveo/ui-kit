'use client';

import {
  recommendationEngineDefinition,
  RecommendationHydratedState,
  RecommendationStaticState,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface RecommendationPageProps {
  staticState: RecommendationStaticState;
  navigatorContext: NavigatorContext;
}

export default function RecommendationProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<RecommendationPageProps>) {
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
      }) // TODO: need to pass the search actions!!!!
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
        <>{children}</>
      </recommendationEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <recommendationEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {/* // TODO: Add KIT-3701:  Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>{children}</>
      </recommendationEngineDefinition.StaticStateProvider>
    );
  }
}
