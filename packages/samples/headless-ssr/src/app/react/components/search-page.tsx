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
import ResultList from './result-list';
import SearchBox from './search-box';

interface SearchPageProviderProps {
  ssrState: SearchSSRState;
}

function SearchPageProvider({
  ssrState,
  children,
}: PropsWithChildren<SearchPageProviderProps>) {
  const [csrResult, setCSRResult] = useState<SearchCSRState | undefined>(
    undefined
  );

  useEffect(() => {
    hydrateInitialState(ssrState).then(({engine, controllers}) => {
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

export default function SearchPage({ssrState}: SearchPageProviderProps) {
  return (
    <SearchPageProvider ssrState={ssrState}>
      <SearchBox />
      <ResultList />
    </SearchPageProvider>
  );
}
