'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '../../_lib/commerce-engine';
import {Cart} from '../cart';
import {ProductList} from '../product-list';
import {StandaloneSearchBox} from '../standalone-search-box';
import {Summary} from '../summary';

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
      />
      <Summary
        staticState={staticState.controllers.summaryListing.state}
        controller={hydratedState?.controllers.summaryListing}
        hydratedState={hydratedState}
      />
      <Cart
        staticState={staticState.controllers.cart.state}
        controller={hydratedState?.controllers.cart}
        staticContextState={staticState.controllers.context.state}
      />
      <ProductList
        staticState={staticState.controllers.productListListing.state}
        controller={hydratedState?.controllers.productListListing}
      />
    </>
  );
}
