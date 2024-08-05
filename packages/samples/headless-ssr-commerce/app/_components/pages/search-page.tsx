'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  SearchHydratedState,
  SearchStaticState,
  searchEngineDefinition,
} from '../../_lib/commerce-engine';
import {ProductList} from '../product-list';
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
      <SearchBox
        staticState={staticState.controllers.searchBox.state}
        controller={hydratedState?.controllers.searchBox}
      ></SearchBox>
      <ProductList
        staticState={staticState.controllers.productListSearch.state}
        controller={hydratedState?.controllers.productListSearch}
      />
      <Summary
        staticState={staticState.controllers.summarySearch.state}
        controller={hydratedState?.controllers.summarySearch}
        hydratedState={hydratedState}
      />
    </>
  );
}
