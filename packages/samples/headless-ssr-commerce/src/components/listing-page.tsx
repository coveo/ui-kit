'use client';

import {NavigatorContext} from '@coveo/headless';
import {useEffect, useState} from 'react';
import {HydrationMetadata} from '../generic/hydration-metadata';
// import {useSyncSearchParameterManager} from '../../hooks/generic/search-parameter-manager';
import {
  SearchStaticState,
  SearchHydratedState,
} from '../lib/generic/commerce-engine';
import {FacetGenerator} from './facet-generator';
import {ProductList} from './product-list';
import {SearchBox} from './search-box';
import {Summary} from './summary';

export default function ListingPage({
  staticState,
  navigatorContext,
}: {
  staticState: SearchStaticState;
  navigatorContext: NavigatorContext;
}) {
  console.log('::: navigatorContext', navigatorContext);
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  useEffect(() => {
    const {context} = staticState.controllers;
    hydrateStaticState({
      searchAction: staticState.searchAction,
      controllers: {
        context: {
          options: context.state,
        },
        // searchParameterManager: {
        //   initialState: searchParameterManager.state,
        // },
      },
    }).then(({engine, controllers}) => {
      setHydratedState({engine, controllers});
    });
  }, [staticState]);

  /**
   * This hook is used to synchronize the URL with the state of the search interface.
   */
  // useSyncSearchParameterManager({
  //   staticState: staticState.controllers.searchParameterManager.state,
  //   controller: hydratedState?.controllers.searchParameterManager,
  // });
  return (
    <>
      <SearchBox
        staticState={staticState.controllers.searchBox.state}
        controller={hydratedState?.controllers.searchBox}
      />
      <Summary
        staticState={staticState.controllers.summary.state}
        controller={hydratedState?.controllers.summary}
      />
      <FacetGenerator
        staticState={staticState.controllers.facets.state} // TODO: the facet generator state is useless
        controller={hydratedState?.controllers.facets}
      />
      <HydrationMetadata
        staticState={staticState.controllers.summary.state}
        searchOrListingHydratedState={hydratedState}
      />
      <ProductList
        staticState={staticState.controllers.productList.state}
        controller={hydratedState?.controllers.productList}
      />
    </>
  );
}
