'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  SearchHydratedState,
  SearchStaticState,
  searchEngineDefinition,
} from '../../_lib/commerce-engine';
import {NotifyTrigger} from '../notify-trigger';
import {ProductList} from '../product-list';
import {QueryTrigger} from '../query-trigger';
import {RedirectionTrigger} from '../redirection-trigger';
import {SearchBox} from '../search-box';
import {Summary} from '../summary';

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
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    searchEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  return (
    <>
      <RedirectionTrigger
        staticState={staticState.controllers.redirectionTrigger.state}
        controller={hydratedState?.controllers.redirectionTrigger}
      />
      <QueryTrigger
        staticState={staticState.controllers.queryTrigger.state}
        controller={hydratedState?.controllers.queryTrigger}
      />
      <SearchBox
        staticState={staticState.controllers.searchBox.state}
        controller={hydratedState?.controllers.searchBox}
        staticStateRecentQueries={
          staticState.controllers.recentQueriesList.state
        }
        recentQueriesController={hydratedState?.controllers.recentQueriesList}
      />
      <Summary
        staticState={staticState.controllers.summary.state}
        controller={hydratedState?.controllers.summary}
        hydratedState={hydratedState}
      />

      <ProductList
        staticState={staticState.controllers.productList.state}
        controller={hydratedState?.controllers.productList}
      />
      <NotifyTrigger
        staticState={staticState.controllers.notifyTrigger.state}
        controller={hydratedState?.controllers.notifyTrigger}
      />
    </>
  );
}
