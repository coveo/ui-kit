'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '../_lib/commerce-engine';
// import Pagination from './pagination';
import {ProductList} from './product-list';
import ShowMore from './show-more';
import Sort from './sort';
import Summary from './summary';

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
      <Summary
        staticState={staticState.controllers.summary.state}
        controller={hydratedState?.controllers.summary}
      />
      <Sort
        staticState={staticState.controllers.sort.state}
        controller={hydratedState?.controllers.sort}
      ></Sort>
      <ProductList
        staticState={staticState.controllers.productList.state}
        controller={hydratedState?.controllers.productList}
      />

      {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
      <ShowMore
        staticState={staticState.controllers.pagination.state}
        controller={hydratedState?.controllers.pagination}
        summaryController={hydratedState?.controllers.summary}
      />
      {/* <Pagination
        staticState={staticState.controllers.pagination.state}
        controller={hydratedState?.controllers.pagination}
      ></Pagination> */}
    </>
  );
}
