import * as externalCartAPI from '@/actions/external-cart-api';
import BreadcrumbManager from '@/components/breadcrumb-manager';
import Cart from '@/components/cart';
import FacetGenerator from '@/components/facets/facet-generator';
import Pagination from '@/components/pagination';
import ProductList from '@/components/product-list';
import ListingProvider from '@/components/providers/listing-provider';
import {Recommendations} from '@/components/recommendation-list';
import Sort from '@/components/sort';
import StandaloneSearchBox from '@/components/standalone-search-box';
import Summary from '@/components/summary';
import {listingEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {headers} from 'next/headers';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await listingEngineDefinition.fetchStaticState({
    controllers: {cart: {initialState: {items}}},
  });

  return (
    <ListingProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <FacetGenerator />
        </div>

        <div style={{flex: 2}}>
          <StandaloneSearchBox />
          <BreadcrumbManager />
          <Summary />
          <Sort />
          <ProductList />
          {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
          <Pagination />
          {/* <ShowMore
            staticState={staticState.controllers.pagination.state}
            controller={hydratedState?.controllers.pagination}
            summaryController={hydratedState?.controllers.summary}
          /> */}
        </div>

        <div style={{flex: 3}}>
          <h3>My Cart</h3>
          <Cart />
        </div>

        <div style={{flex: 4}}>
          <Recommendations />
        </div>
      </div>
    </ListingProvider>
  );
}

export const dynamic = 'force-dynamic';
