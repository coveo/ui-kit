'use client';

import {
  SearchSSRState,
  SearchCSRState,
  hydrateInitialState,
} from '@/src/common/engine';
import {useEffect, useState} from 'react';
import {useSyncSearchParameters} from '../hooks/search-parameters';
import {HydrationMetadata} from './hydration-metadata';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';

export default function SearchPage({ssrState}: {ssrState: SearchSSRState}) {
  const [csrResult, setCSRResult] = useState<SearchCSRState | undefined>(
    undefined
  );

  useEffect(() => {
    hydrateInitialState({
      searchFulfilledAction: ssrState.searchFulfilledAction,
      controllers: {
        searchParameters: {
          initialState: ssrState.controllers.searchParameters.state,
        },
      },
    }).then(({engine, controllers}) => {
      setCSRResult({engine, controllers});
    });
  }, [ssrState]);

  useSyncSearchParameters({
    initialState: ssrState.controllers.searchParameters.state,
    controller: csrResult?.controllers.searchParameters,
  });

  return (
    <>
      <HydrationMetadata ssrState={ssrState} csrResult={csrResult} />
      <SearchBox
        initialState={ssrState.controllers.searchBox.state}
        controller={csrResult?.controllers.searchBox}
      />
      <ResultList
        initialState={ssrState.controllers.resultList.state}
        controller={csrResult?.controllers.resultList}
      />
    </>
  );
}
