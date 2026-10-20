import {
  buildParameterSerializer,
  type ContextOptions,
} from '@coveo/headless-react/ssr-commerce-next';
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
import {ListingProvider, RecommendationProvider} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import PopularViewed from '@/components/recommendations/popular-viewed';
import Sort from '@/components/sort';
import StandaloneSearchBox from '@/components/standalone-search-box';
import Summary from '@/components/summary';
import NotifyTrigger from '@/components/triggers/notify-trigger';
import {listingEngineDefinition, recommendationEngineDefinition} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
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

  // The navigator context describes the visitor's browser. It is passed to every `fetchStaticState` call.
  const navigatorContext = await getNavigatorContext();

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
    navigatorContext,
    searchParams: parameters,
  });

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext,
    recommendations: ['popularBought', 'popularViewed'],
  });

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
          {/* The search page uses ShowMore instead: the two components showcase two frequent ways to implement pagination. */}
          <Pagination />
          <ProductsPerPage />
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
