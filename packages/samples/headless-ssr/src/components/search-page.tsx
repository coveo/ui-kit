'use client';

import {SearchHydrationResult, hydrateInitialState} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import ResultList from './result-list';

// TODO: replace "any" with specific type
export default function SearchPage({engineSnapshot}: {engineSnapshot: any}) {
  const [hydrationResult, setHydrationResult] =
    useState<SearchHydrationResult | null>(null);

  useEffect(() => {
    hydrateInitialState(engineSnapshot).then(({engine, controllers}) => {
      setHydrationResult({engine, controllers});
    });
  }, [engineSnapshot]);

  if (hydrationResult !== null) {
    const {engine, controllers} = hydrationResult;
    return <ResultList engine={engine} controllers={controllers}></ResultList>;
  }
}
