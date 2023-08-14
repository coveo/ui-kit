'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import {HydrationMetadata} from './hydration-metadata';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';

export default function SearchPage({
  initialState,
}: {
  initialState: SearchSSRState;
}) {
  const [hydrationResult, setHydrationResult] = useState<
    SearchCSRState | undefined
  >(undefined);

  useEffect(() => {
    hydrateInitialState(initialState).then(({engine, controllers}) => {
      setHydrationResult({engine, controllers});
    });
  }, [initialState]);

  return (
    <>
      <HydrationMetadata
        initialState={initialState}
        hydrationResult={hydrationResult}
      />
      <SearchBox
        initialState={initialState.controllers.searchBox.state}
        controller={hydrationResult?.controllers.searchBox}
      />
      <ResultList
        initialState={initialState.controllers.resultList.state}
        controller={hydrationResult?.controllers.resultList}
      />
    </>
  );
}
