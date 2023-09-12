'use client';

import {
  SearchStaticState,
  SearchHydratedState,
  hydrateStaticState,
  CSRProvider,
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
  const [hydratedState, setCSRResult] = useState<
    SearchHydratedState | undefined
  >(undefined);

  useEffect(() => {
    hydrateStaticState({
      searchFulfilledAction: staticState.searchFulfilledAction,
      controllers: {
        searchParameters: {
          initialState: staticState.controllers.searchParameters.state,
        },
      },
    }).then(({engine, controllers}) => {
      setCSRResult({engine, controllers});
    });
  }, [staticState]);

  if (hydratedState) {
    return (
      <CSRProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
        <HydrationMetadata
          staticState={staticState}
          hydratedState={hydratedState}
        />
      </CSRProvider>
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
