'use client';

import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '@/lib/commerce-engine';
import {
  CommerceSearchParameters,
  NavigatorContext,
} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface ListingPageProps {
  staticState: ListingStaticState;
  searchParams: CommerceSearchParameters;
  navigatorContext: NavigatorContext;
}

export default function ListingProvider({
  staticState,
  searchParams,
  navigatorContext,
  children,
}: PropsWithChildren<ListingPageProps>) {
  const [hydratedState, setHydratedState] = useState<
    ListingHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);
  if (typeof window !== 'undefined') {
    console.log('I CAST COOKIE');
    document.cookie = `searchParamCache=${btoa(JSON.stringify({state: staticState.controllers.parameterManager.state, cachedParams: searchParams, searchUid: staticState.controllers.summary.state.searchuid}))}; expires=${new Date(Date.now() + 5e3).toUTCString()}`;
  }

  useEffect(() => {
    listingEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
        controllers: {
          parameterManager: {
            initialState: staticState.controllers.parameterManager.state,
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
      <listingEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        <>{children}</>
      </listingEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <listingEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {/* // TODO: FIXME:  Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>{children}</>
      </listingEngineDefinition.StaticStateProvider>
    );
  }
}
