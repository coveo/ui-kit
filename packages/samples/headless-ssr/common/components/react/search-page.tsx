'use client';

import {useEffect, useState, PropsWithChildren} from 'react';
import {
  SearchStaticState,
  SearchHydratedState,
  hydrateStaticState,
  HydratedStateProvider,
  StaticStateProvider,
} from '../../lib/react/engine';
import {HydrationMetadata} from '../common/hydration-metadata';

interface SearchPageProviderProps {
  staticState: SearchStaticState;
}

export function SearchPageProvider({
  staticState,
  children,
}: PropsWithChildren<SearchPageProviderProps>) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  useEffect(() => {
    const {searchParameters, context} = staticState.controllers;
    hydrateStaticState({
      searchAction: staticState.searchAction,
      controllers: {
        context: {
          initialState: context.state,
        },
        searchParameters: {
          initialState: searchParameters.state,
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
