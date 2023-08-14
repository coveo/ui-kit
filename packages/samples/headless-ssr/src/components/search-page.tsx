'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import {ResultList} from './result-list';

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

  return (
    <ResultList
      initialState={initialState.controllers.resultList.state}
      controller={hydrationResult?.controllers.resultList}
    />
  );
}
