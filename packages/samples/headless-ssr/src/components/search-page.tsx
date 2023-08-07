'use client';

import {SearchHydrationResult, hydrateInitialState} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import ResultList from './result-list';

export default function SearchPage({engineSnapshot}: {engineSnapshot: any}) {
  const [hydrationResult, setHydrationResult] =
    useState<SearchHydrationResult | null>(null);

  useEffect(() => {
    hydrateInitialState(engineSnapshot).then(({engine, controllers}) => {
      setHydrationResult({engine, controllers});
    });
  }, [engineSnapshot]);

  const results = hydrationResult
    ? hydrationResult.engine.state.search.results
    : engineSnapshot.controllers.resultList.state;
  return results && <ResultList results={results}></ResultList>;
}
