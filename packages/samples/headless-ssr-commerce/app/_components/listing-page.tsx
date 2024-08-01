'use client';

import {useEffect, useState} from 'react';
import {
  ProductListingEngine,
  ListingHydratedState,
  ListingStaticState,
} from '../_lib/commerce-engine';
import {ProductList} from './product-list';
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
    ProductListingEngine.hydrateStaticState({
      searchAction: staticState.searchAction,
    }).then(({engine, controllers}) => {
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
