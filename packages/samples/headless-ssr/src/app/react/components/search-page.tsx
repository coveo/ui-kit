'use client';

import {
  SearchStaticState,
  SearchHydratedState,
  hydrateStaticState,
  HydratedProvider,
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
  const [hydratedState, setHydratedResult] = useState<
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
      setHydratedResult({engine, controllers});
    });
  }, [staticState]);

  if (hydratedState) {
    return (
      <HydratedProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
        <HydrationMetadata
          staticState={staticState}
          hydratedState={hydratedState}
        />
      </HydratedProvider>
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
