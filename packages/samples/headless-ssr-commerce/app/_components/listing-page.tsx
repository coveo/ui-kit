'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '../_lib/commerce-engine';
import {ProductList} from './product-list';
import {Summary} from './summary';

export default function ListingPage({
  staticState,
  navigatorContext,
}: {
  staticState: ListingStaticState;
  navigatorContext: NavigatorContext;
}) {
  const [hydratedState, setHydratedState] = useState<
    ListingHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    listingEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  return (
    <>
      {/* TODO: add UI component here */}
      <ProductList
        staticState={staticState.controllers.productList.state}
        controller={hydratedState?.controllers.productList}
      />
      <Summary
        staticState={staticState.controllers.summary.state}
        controller={hydratedState?.controllers.summary}
        hydratedState={hydratedState}
      />
    </>
  );
}
