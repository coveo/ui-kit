'use client';

import {
  SearchStaticState,
  SearchHydratedState,
  fetchBuildResult,
  hydrateStaticState,
  HydratedStateProvider,
  StaticStateProvider,
} from '@/src/app/react/common/engine';
import {useEffect, useState, PropsWithChildren} from 'react';
import {HydrationMetadata} from '../../common/hydration-metadata';

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
    fetchBuildResult({
      searchParametersInitialState:
        staticState.controllers.searchParameters.state,
    })
      .then((buildResult) =>
        hydrateStaticState({
          buildResult,
          searchAction: staticState.searchAction,
        })
      )
      .then(({engine, controllers}) => {
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
