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
import SearchBox from './search-box';

export default function SearchPage({ssrState}: {ssrState: SearchSSRState}) {
  const [csrResult, setCSRResult] = useState<SearchCSRState | undefined>(
    undefined
  );

  useEffect(() => {
    hydrateInitialState(ssrState).then(({engine, controllers}) => {
      setCSRResult({engine, controllers});
    });
  }, [ssrState]);

  const content = (
    <>
      <SearchBox />
      <ResultList />
      <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
    </>
  );

  if (csrResult) {
    return (
      <CSRProvider
        engine={csrResult.engine}
        controllers={csrResult.controllers}
      >
        {content}
      </CSRProvider>
    );
  } else {
    return (
      <SSRStateProvider controllers={ssrState.controllers}>
        {content}
      </SSRStateProvider>
    );
  }
}
