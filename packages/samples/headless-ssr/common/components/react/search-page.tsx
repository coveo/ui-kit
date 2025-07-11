'use client';

import type {NavigatorContext} from '@coveo/headless/ssr';
import {type PropsWithChildren, useEffect, useState} from 'react';
import {
  HydratedStateProvider,
  hydrateStaticState,
  type SearchHydratedState,
  type SearchStaticState,
  StaticStateProvider,
  setNavigatorContextProvider,
} from '../../lib/react/engine';
import {HydrationMetadata} from '../common/hydration-metadata';

interface SearchPageProviderProps {
  staticState: SearchStaticState;
  navigatorContext: NavigatorContext;
}

export function SearchPageProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<SearchPageProviderProps>) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    const {searchParameterManager, context} = staticState.controllers;
    hydrateStaticState({
      searchAction: staticState.searchAction,
      controllers: {
        context: {
          initialState: context.state,
        },
        searchParameterManager: {
          initialState: searchParameterManager.state,
        },
      },
    }).then(({engine, controllers}) => {
      setHydratedState({engine, controllers});
    });
  }, [staticState]);

  if (hydratedState) {
    return (
      <HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
        <HydrationMetadata
          staticState={staticState}
          hydratedState={hydratedState}
        />
      </HydratedStateProvider>
    );
  } else {
    return (
      <StaticStateProvider controllers={staticState.controllers}>
        {children}
        <HydrationMetadata
          staticState={staticState}
          hydratedState={hydratedState}
        />
      </StaticStateProvider>
    );
  }
}
