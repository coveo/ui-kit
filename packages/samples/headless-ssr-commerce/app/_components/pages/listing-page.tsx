'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '../../_lib/commerce-engine';
import Cart from '../cart';
import Pagination from '../pagination';
import ProductList from '../product-list';
import Sort from '../sort';
import StandaloneSearchBox from '../standalone-search-box';
import Summary from '../summary';

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
      <StandaloneSearchBox
        staticState={staticState.controllers.standaloneSearchBox.state}
        controller={hydratedState?.controllers.standaloneSearchBox}
        staticStateRecentQueries={
          staticState.controllers.recentQueriesList.state
        }
        recentQueriesController={hydratedState?.controllers.recentQueriesList}
        staticStateInstantProducts={
          staticState.controllers.instantProducts.state
        }
        instantProductsController={hydratedState?.controllers.instantProducts}
      />
      <Summary
        staticState={staticState.controllers.summary.state}
        controller={hydratedState?.controllers.summary}
      />
      <Sort
        staticState={staticState.controllers.sort.state}
        controller={hydratedState?.controllers.sort}
      ></Sort>
      <Cart
        staticState={staticState.controllers.cart.state}
        controller={hydratedState?.controllers.cart}
        staticContextState={staticState.controllers.context.state}
      />
      <ProductList
        staticState={staticState.controllers.productList.state}
        controller={hydratedState?.controllers.productList}
      />
      {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
      <Pagination
        staticState={staticState.controllers.pagination.state}
        controller={hydratedState?.controllers.pagination}
      ></Pagination>
      {/* <ShowMore
        staticState={staticState.controllers.pagination.state}
        controller={hydratedState?.controllers.pagination}
        summaryController={hydratedState?.controllers.summary}
      /> */}
    </>
  );
}
