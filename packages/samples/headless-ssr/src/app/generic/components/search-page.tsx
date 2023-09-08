'use client';

import {
  SearchInitialState,
  SearchHydratedState,
  hydrateInitialState,
} from '@/src/app/generic/common/engine';
import {useEffect, useState} from 'react';
import {HydrationMetadata} from '../../common/hydration-metadata';
import {useSyncSearchParameters} from '../hooks/search-parameters';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';

export default function SearchPage({
  initialState,
}: {
  initialState: SearchInitialState;
}) {
  const [hydratedState, setCSRResult] = useState<
    SearchHydratedState | undefined
  >(undefined);

  useEffect(() => {
    hydrateInitialState({
      searchFulfilledAction: initialState.searchFulfilledAction,
      controllers: {
        searchParameters: {
          initialState: initialState.controllers.searchParameters.state,
        },
      },
    }).then(({engine, controllers}) => {
      setCSRResult({engine, controllers});
    });
  }, [initialState]);

  useSyncSearchParameters({
    initialState: initialState.controllers.searchParameters.state,
    controller: hydratedState?.controllers.searchParameters,
  });

  return (
    <>
      <SearchBox
        initialState={initialState.controllers.searchBox.state}
        controller={hydratedState?.controllers.searchBox}
      />
      <ResultList
        initialState={initialState.controllers.resultList.state}
        controller={hydratedState?.controllers.resultList}
      />
      <HydrationMetadata
        initialState={initialState}
        hydratedState={hydratedState}
      />
    </>
  );
}
