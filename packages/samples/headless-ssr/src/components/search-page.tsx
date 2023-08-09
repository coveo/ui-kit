'use client';

import {
  SearchInitialState,
  SearchLiveState,
  hydrateInitialState,
} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import ResultList from './result-list';

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

  const results = hydrationResult
    ? hydrationResult.controllers.resultList.state.results
    : initialState.controllers.resultList.state.results;
  return results && <ResultList results={results}></ResultList>;
}
