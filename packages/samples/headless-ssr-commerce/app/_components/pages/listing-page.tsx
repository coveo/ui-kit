'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '../../_lib/commerce-engine';
import Cart from '../cart';
import FacetGenerator from '../facets/facet-generator';
import Pagination from '../pagination';
import ProductList from '../product-list';
import {Recommendations} from '../recommendation-list';
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
        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        controllers.popularBoughtRecs.refresh();
      });
  }, [staticState]);

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <StandaloneSearchBox
            staticState={staticState.controllers.standaloneSearchBox.state}
            controller={hydratedState?.controllers.standaloneSearchBox}
            staticStateRecentQueries={
              staticState.controllers.recentQueriesList.state
            }
            recentQueriesController={
              hydratedState?.controllers.recentQueriesList
            }
            staticStateInstantProducts={
              staticState.controllers.instantProducts.state
            }
            instantProductsController={
              hydratedState?.controllers.instantProducts
            }
          />
          <FacetGenerator
            staticState={staticState.controllers.facetGenerator.state}
            controller={hydratedState?.controllers.facetGenerator}
          />
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
          <Pagination
            staticState={staticState.controllers.pagination.state}
            controller={hydratedState?.controllers.pagination}
          ></Pagination>
          {/* <ShowMore
            staticState={staticState.controllers.pagination.state}
            controller={hydratedState?.controllers.pagination}
            summaryController={hydratedState?.controllers.summary}
          /> */}
        </div>

        <div style={{flex: 1}}>
          <h3>My Cart</h3>
          <Cart
            staticState={staticState.controllers.cart.state}
            controller={hydratedState?.controllers.cart}
            staticContextState={staticState.controllers.context.state}
          />
        </div>

        <div style={{flex: 1}}>
          <Recommendations
            staticState={staticState.controllers.popularBoughtRecs.state}
            controller={hydratedState?.controllers.popularBoughtRecs}
          />
        </div>
      </div>
    </>
  );
}
