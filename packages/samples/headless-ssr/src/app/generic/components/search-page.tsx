'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
} from '@/src/app/generic/common/engine';
import {useEffect, useState} from 'react';
import {HydrationMetadata} from '../../common/hydration-metadata';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';

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
      <SearchBox
        ssrState={ssrState.controllers.searchBox.state}
        controller={csrResult?.controllers.searchBox}
      />
      <ResultList
        ssrState={ssrState.controllers.resultList.state}
        controller={csrResult?.controllers.resultList}
      />
      <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
    </>
  );
}
