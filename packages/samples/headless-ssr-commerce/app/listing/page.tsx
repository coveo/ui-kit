import {headers} from 'next/headers';
import BreadcrumbManager from '../_components/breadcrumb-manager';
import Cart from '../_components/cart';
import FacetGenerator from '../_components/facets/facet-generator';
import ListingPage from '../_components/pages/listing-page';
import Pagination from '../_components/pagination';
import ProductList from '../_components/product-list';
import Recommendations from '../_components/recommendation-list';
import Sort from '../_components/sort';
import StandaloneSearchBox from '../_components/standalone-search-box';
import Summary from '../_components/summary';
import {listingEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await listingEngineDefinition.fetchStaticState();

  return (
    <ListingPage
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <StandaloneSearchBox />
          <BreadcrumbManager />
          <FacetGenerator />
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

        <div style={{flex: 1}}>
          <h3>My Cart</h3>
          <Cart />
        </div>

        <div style={{flex: 1}}>
          <Recommendations />
        </div>
      </div>
    </ListingPage>
  );
}

export const dynamic = 'force-dynamic';
