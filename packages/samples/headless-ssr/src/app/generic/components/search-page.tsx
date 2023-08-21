'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
} from '@/src/app/generic/common/engine';
import {useEffect, useState} from 'react';
import {HydrationMetadata} from './hydration-metadata';
import {ResultList} from './result-list';

export default function SearchPage({ssrState}: {ssrState: SearchSSRState}) {
  const [csrResult, setCSRResult] = useState<SearchCSRState | undefined>(
    undefined
  );

  useEffect(() => {
    hydrateInitialState(ssrState).then(({engine, controllers}) => {
      setCSRResult({engine, controllers});
    });
  }, [ssrState]);
  return (
    <>
      <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
      <ResultList
        initialState={ssrState.controllers.resultList.state}
        controller={csrResult?.controllers.resultList}
      />
    </>
  );
}
