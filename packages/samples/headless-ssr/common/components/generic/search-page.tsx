'use client';

import {NavigatorContext} from '@coveo/headless/ssr';
import {useEffect, useState} from 'react';
import {useSyncSearchParameterManager} from '../../hooks/generic/search-parameter-manager';
import {
  SearchStaticState,
  SearchHydratedState,
  hydrateStaticState,
  setNavigatorContextProvider,
} from '../../lib/generic/engine';
import {HydrationMetadata} from '../common/hydration-metadata';
import {Facet} from './facet';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';

export default function SearchPage({
  staticState,
  navigatorContext,
}: {
  staticState: SearchStaticState;
  navigatorContext: NavigatorContext;
}) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    const {searchParameterManager, context} = staticState.controllers;
    hydrateStaticState({
      searchAction: staticState.searchAction,
      controllers: {
        context: {
          initialState: context.state,
        },
        searchParameterManager: {
          initialState: searchParameterManager.state,
        },
      },
    }).then(({engine, controllers}) => {
      setHydratedState({engine, controllers});
    });
  }, [staticState]);

  /**
   * This hook is used to synchronize the URL with the state of the search interface.
   */
  useSyncSearchParameterManager({
    staticState: staticState.controllers.searchParameterManager.state,
    controller: hydratedState?.controllers.searchParameterManager,
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
