'use client';

import {
  SearchHydratedState,
  SearchStaticState,
  searchEngineDefinition,
} from '@/lib/commerce-engine';
import {
  CommerceSearchParameters,
  NavigatorContext,
} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface SearchPageProps {
  staticState: SearchStaticState;
  searchParams: CommerceSearchParameters;
  navigatorContext: NavigatorContext;
}

export default function SearchProvider({
  staticState,
  searchParams,
  navigatorContext,
  children,
}: PropsWithChildren<SearchPageProps>) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);
  if (typeof window !== 'undefined') {
    console.log('I CAST COOKIE');
    document.cookie = `searchParamCache=${btoa(JSON.stringify({state: staticState.controllers.parameterManager.state, cachedParams: searchParams, searchUid: staticState.controllers.summary.state.searchuid}))}; expires=${new Date(Date.now() + 5e3).toUTCString()}`;
  }
  useEffect(() => {
    searchEngineDefinition
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
        // controllers.popularBoughtRecs.refresh();
      });
  }, [staticState]);

  if (hydratedState) {
    return (
      <searchEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {/* // TODO: KIT-3701: Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>{children}</>
      </searchEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <searchEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {/* // TODO: KIT-3701: Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>{children}</>
      </searchEngineDefinition.StaticStateProvider>
    );
  }
}
