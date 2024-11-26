'use client';

import {
  SearchHydratedState,
  SearchStaticState,
  searchEngineDefinition,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';
import {HydrationMetadata} from '../hydration-metadata';

interface SearchPageProps {
  staticState: SearchStaticState;
  navigatorContext: NavigatorContext;
}

export default function SearchProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<SearchPageProps>) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    searchEngineDefinition
      .hydrateStaticState({
        searchActions: staticState.searchActions,
        controllers: {
          cart: {
            initialState: {items: staticState.controllers.cart.state.items},
          },
          context: staticState.controllers.context.state,
        },
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});

        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        // controllers.popularBoughtRecs.refresh();
      });
  }, [staticState]);

  if (hydratedState) {
    return (
      <searchEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
        <HydrationMetadata
          staticState={staticState}
          hydratedState={hydratedState}
        />
      </searchEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <searchEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {children}
        <HydrationMetadata staticState={staticState} />
      </searchEngineDefinition.StaticStateProvider>
    );
  }
}
