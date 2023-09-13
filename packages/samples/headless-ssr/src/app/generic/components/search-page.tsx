'use client';

import {
  SearchStaticState,
  SearchHydratedState,
  hydrateStaticState,
} from '@/src/app/generic/common/engine';
import {useEffect, useState} from 'react';
import {HydrationMetadata} from '../../common/hydration-metadata';
import {useSyncSearchParameters} from '../hooks/search-parameters';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';

export default function SearchPage({
  staticState,
}: {
  staticState: SearchStaticState;
}) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  useEffect(() => {
    hydrateStaticState({
      searchFulfilledAction: staticState.searchFulfilledAction,
      controllers: {
        searchParameters: {
          initialState: staticState.controllers.searchParameters.state,
        },
      },
    }).then(({engine, controllers}) => {
      setHydratedState({engine, controllers});
    });
  }, [staticState]);

  useSyncSearchParameters({
    staticState: staticState.controllers.searchParameters.state,
    controller: hydratedState?.controllers.searchParameters,
  });

  return (
    <>
      <SearchBox
        staticState={staticState.controllers.searchBox.state}
        controller={hydratedState?.controllers.searchBox}
      />
      <ResultList
        staticState={staticState.controllers.resultList.state}
        controller={hydratedState?.controllers.resultList}
      />
      <HydrationMetadata
        staticState={staticState}
        hydratedState={hydratedState}
      />
    </>
  );
}
