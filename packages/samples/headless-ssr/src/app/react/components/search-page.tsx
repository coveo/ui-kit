'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
  CSRProvider,
  SSRStateProvider,
} from '@/src/app/react/common/engine';
import {useEffect, useState} from 'react';
import {HydrationMetadata} from '../../common/hydration-metadata';
import ResultList from './result-list';

export default function SearchPage({ssrState}: {ssrState: SearchSSRState}) {
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
        <ResultList />
        <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
      </CSRProvider>
    );
  } else {
    return (
      <SSRStateProvider controllers={ssrState.controllers}>
        <ResultList />
        <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
      </SSRStateProvider>
    );
  }
}
