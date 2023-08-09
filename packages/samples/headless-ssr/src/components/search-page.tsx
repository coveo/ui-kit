'use client';

import {
  SearchInitialState,
  SearchLiveState,
  hydrateInitialState,
} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import {ResultList} from './result-list';

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
    <ResultList
      initialState={initialState.controllers.resultList.state}
      controller={hydrationResult?.controllers.resultList}
    />
  );
}
