'use client';

import {useEffect, useState} from 'react';
import {useSyncSearchParameters} from '../../hooks/generic/search-parameters';
import {
  SearchStaticState,
  SearchHydratedState,
  hydrateStaticState,
} from '../../lib/generic/engine';
import {HydrationMetadata} from '../common/hydration-metadata';
import {Facet} from './facet';
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
    const {searchParameters, context} = staticState.controllers;
    hydrateStaticState({
      searchAction: staticState.searchAction,
      controllers: {
        context: {
          initialState: context.state,
        },
        searchParameters: {
          initialState: searchParameters.state,
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
      <Facet
        title="Author"
        staticState={staticState.controllers.authorFacet.state}
        controller={hydratedState?.controllers.authorFacet}
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
