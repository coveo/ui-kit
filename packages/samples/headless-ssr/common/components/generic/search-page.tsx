'use client';

import type {NavigatorContext} from '@coveo/headless/ssr';
import {useEffect, useState} from 'react';
import {useSyncSearchParameterManager} from '../../hooks/generic/search-parameter-manager';
import {
  hydrateStaticState,
  type SearchHydratedState,
  type SearchStaticState,
  setNavigatorContextProvider,
} from '../../lib/generic/engine';
import {HydrationMetadata} from '../common/hydration-metadata';
import {Facet} from './facet';
import {ResultList} from './result-list';
import {SearchBox} from './search-box';
import {Tab} from './tab';
import {TabManager} from './tabs-manager';

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
      <TabManager
        staticState={staticState.controllers.tabManager.state}
        controller={hydratedState?.controllers.tabManager}
      >
        <Tab
          staticState={staticState.controllers.tabAll.state}
          controller={hydratedState?.controllers.tabAll}
          tabManager={hydratedState?.controllers.tabManager}
          tabName={'all'}
          tabLabel={'All'}
        ></Tab>
        <Tab
          staticState={staticState.controllers.tabCountries.state}
          controller={hydratedState?.controllers.tabCountries}
          tabManager={hydratedState?.controllers.tabManager}
          tabName={'countries'}
          tabLabel={'Countries'}
        ></Tab>
        <Tab
          staticState={staticState.controllers.tabVideos.state}
          controller={hydratedState?.controllers.tabVideos}
          tabManager={hydratedState?.controllers.tabManager}
          tabName={'videos'}
          tabLabel={'Videos'}
        ></Tab>
      </TabManager>
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
