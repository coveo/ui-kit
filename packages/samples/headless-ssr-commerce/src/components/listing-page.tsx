'use client';

import {useEffect, useState} from 'react';
import {
  hydrateStaticState,
  ListingHydratedState,
  ListingStaticState,
} from '../lib/commerce-engine';
import {Cart} from './cart';
import {ProductList} from './product-list';
import {SearchBox} from './search-box';
import {Summary} from './summary';

export default function ListingPage({
  staticState,
}: {
  staticState: ListingStaticState;
}) {
  const [hydratedState, setHydratedState] = useState<
    ListingHydratedState | undefined
  >(undefined);

  useEffect(() => {
    hydrateStaticState({
      searchAction: staticState.searchAction,
    }).then(({engine, controllers}) => {
      setHydratedState({engine, controllers});
    });
  }, [staticState]);

  return (
    <>
      <Cart
        staticState={staticState.controllers.cart.state}
        controller={hydratedState?.controllers.cart}
      ></Cart>
      <SearchBox
        staticState={staticState.controllers.searchBox.state}
        controller={hydratedState?.controllers.searchBox}
      ></SearchBox>
      <ProductList
        staticState={staticState.controllers.productListing.state}
        controller={hydratedState?.controllers.productListing}
        cartController={hydratedState?.controllers.cart}
      />
      <Summary
        staticState={staticState.controllers.summary.state}
        controller={hydratedState?.controllers.summary}
        hydratedState={hydratedState}
      />
    </>
  );
}
