'use client';

import {
  SearchInitialState,
  SearchLiveState,
  hydrateInitialState,
} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';

export default function SearchPage({
  initialState,
}: {
  initialState: SearchInitialState;
}) {
  const [hydrationResult, setHydrationResult] =
    useState<SearchLiveState | null>(null);

  useEffect(() => {
    hydrateInitialState(initialState).then(({engine, controllers}) => {
      setHydrationResult({engine, controllers});
    });
  }, [initialState]);

  return (
    <>
      <SearchBox
        initialState={initialState.controllers.searchBox.state}
        controller={hydrationResult?.controllers.searchBox}
      />
      <ResultList
        results={
          (hydrationResult ? hydrationResult : initialState).controllers
            .resultList.state.results
        }
      />
    </>
  );
}
