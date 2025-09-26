import {
  buildParameterSerializer,
  type ContextOptions,
} from '@coveo/headless-react/ssr-commerce-next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import * as externalCartAPI from '@/actions/external-cart-api';
import BreadcrumbManager from '@/components/breadcrumb-manager';
import Cart from '@/components/cart';
import ContextDropdown from '@/components/context-dropdown';
import FacetGenerator from '@/components/facets/facet-generator';
import Pagination from '@/components/pagination';
import ParameterManager from '@/components/parameter-manager';
import ProductList from '@/components/product-list';
import ProductsPerPage from '@/components/products-per-page';
import {
  ListingProvider,
  RecommendationProvider,
} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import PopularViewed from '@/components/recommendations/popular-viewed';
import Sort from '@/components/sort';
import StandaloneSearchBox from '@/components/standalone-search-box';
import Summary from '@/components/summary';
import NotifyTrigger from '@/components/triggers/notify-trigger';
import {
  listingEngineDefinition,
  recommendationEngineDefinition,
} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

// This is a hardcoded list of categories that are available in my coveo merchandising hub.
const categoryList = ['surf-accessories', 'paddleboards', 'toys'];
/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing({
  params,
  searchParams,
}: {
  params: Promise<{category: string}>;
  searchParams: Promise<URLSearchParams>;
}) {
  const {category} = await params;

  const isCategoryMatched = categoryList.includes(category);

  if (!isCategoryMatched) {
    notFound();
  }

  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(await headers());

  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(await searchParams);

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Define the context options for listing and recommendations
  const context: ContextOptions = {
    language: defaultContext.language,
    country: defaultContext.country,
    currency: defaultContext.currency,
    view: {
      url: `https://sports.barca.group/browse/promotions/${category}`,
    },
  };

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await listingEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext: navigatorContext.marshal,
    searchParams: parameters,
  });

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    {
      cart: {items},
      context,
      navigatorContext: navigatorContext.marshal,
      recommendations: ['popularBought', 'popularViewed'],
    }
  );

  return (
    <ListingProvider staticState={staticState}>
      <ParameterManager url={navigatorContext.location} />
      <NotifyTrigger />
      <ContextDropdown useCase="listing" />
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
          <ProductsPerPage />
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
          <RecommendationProvider staticState={recsStaticState}>
            <PopularBought />
            <PopularViewed />
          </RecommendationProvider>
        </div>
      </div>
    </ListingProvider>
  );
}

export const dynamic = 'force-dynamic';
