'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
  CSRProvider,
  SSRStateProvider,
} from '@/src/app/react/common/engine';
import {useEffect, useState, PropsWithChildren} from 'react';
import {HydrationMetadata} from '../../common/hydration-metadata';

interface SearchPageProviderProps {
  ssrState: SearchSSRState;
}

export function SearchPageProvider({
  ssrState,
  children,
}: PropsWithChildren<SearchPageProviderProps>) {
  const [csrResult, setCSRResult] = useState<SearchCSRState | undefined>(
    undefined
  );

  useEffect(() => {
    hydrateInitialState({
      searchFulfilledAction: ssrState.searchFulfilledAction,
      controllers: {
        searchParameters: {
          initialState: ssrState.controllers.searchParameters.state,
        },
      },
    }).then(({engine, controllers}) => {
      setCSRResult({engine, controllers});
    });
  }, [ssrState]);

  if (csrResult) {
    return (
      <CSRProvider
        engine={csrResult.engine}
        controllers={csrResult.controllers}
      >
        {children}
        <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
      </CSRProvider>
    );
  } else {
    return (
      <SSRStateProvider controllers={ssrState.controllers}>
        {children}
        <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
      </SSRStateProvider>
    );
  }
}
