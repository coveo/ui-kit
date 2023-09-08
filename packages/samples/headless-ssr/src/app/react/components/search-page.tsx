'use client';

import {
  SearchInitialState,
  SearchHydratedState,
  hydrateInitialState,
  CSRProvider,
  InitialStateProvider,
} from '@/src/app/react/common/engine';
import {useEffect, useState, PropsWithChildren} from 'react';
import {HydrationMetadata} from '../../common/hydration-metadata';

interface SearchPageProviderProps {
  initialState: SearchInitialState;
}

export function SearchPageProvider({
  initialState,
  children,
}: PropsWithChildren<SearchPageProviderProps>) {
  const [hydratedState, setCSRResult] = useState<
    SearchHydratedState | undefined
  >(undefined);

  useEffect(() => {
    hydrateInitialState({
      searchFulfilledAction: initialState.searchFulfilledAction,
      controllers: {
        searchParameters: {
          initialState: initialState.controllers.searchParameters.state,
        },
      },
    }).then(({engine, controllers}) => {
      setCSRResult({engine, controllers});
    });
  }, [initialState]);

  if (hydratedState) {
    return (
      <CSRProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
        <HydrationMetadata
          initialState={initialState}
          hydratedState={hydratedState}
        />
      </CSRProvider>
    );
  } else {
    return (
      <InitialStateProvider controllers={initialState.controllers}>
        {children}
        <HydrationMetadata
          initialState={initialState}
          hydratedState={hydratedState}
        />
      </InitialStateProvider>
    );
  }
}
