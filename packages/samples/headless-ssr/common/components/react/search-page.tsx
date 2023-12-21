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
      // This makes children render twice. Once with the static state and once with the hydrated state. which is not ideal performance wise
      // TODO: make sure children are only rendered once if possible
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
