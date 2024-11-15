'use client';

import {
  recommendationEngineDefinition,
  RecommendationHydratedState,
  RecommendationStaticState,
} from '@/lib/commerce-engine';
import {defaultContext} from '@/utils/context';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface RecomendationProviderProps {
  staticState: RecommendationStaticState;
  navigatorContext: NavigatorContext;
}

export default function RecommendationProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<RecomendationProviderProps>) {
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
        searchAction: staticState.searchAction,
        // This is all bad ? I don't want to put that here, ONLY RECS FOR RECS
        controllers: {
          cart: {
            initialState: {items: []},
          },
          context: {
            ...defaultContext,
            view: {
              url: 'https://sports.barca.group/browse/promotions',
            },
          },
        },
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        // controllers.popularBoughtRecs.refresh(); // FIXME: does not work
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
