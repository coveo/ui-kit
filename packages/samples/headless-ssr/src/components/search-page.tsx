'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import ResultList from './result-list';

export default function SearchPage({
  initialState,
}: {
  initialState: SearchSSRState;
}) {
  const [hydrationResult, setHydrationResult] = useState<SearchCSRState | null>(
    null
  );

  useEffect(() => {
    hydrateInitialState(initialState).then(({engine, controllers}) => {
      setHydrationResult({engine, controllers});
    });
  }, [initialState]);

  const results = hydrationResult
    ? hydrationResult.controllers.resultList.state.results
    : initialState.controllers.resultList.state.results;
  return <ResultList results={results}></ResultList>;
}
