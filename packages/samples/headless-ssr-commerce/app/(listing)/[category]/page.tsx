import * as externalCartAPI from '@/actions/external-cart-api';
import BreadcrumbManager from '@/components/breadcrumb-manager';
import Cart from '@/components/cart';
import ContextDropdown from '@/components/context-dropdown';
import FacetGenerator from '@/components/facets/facet-generator';
import Pagination from '@/components/pagination';
import ProductList from '@/components/product-list';
import {
  ListingProvider,
  RecommendationProvider,
} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import PopularViewed from '@/components/recommendations/popular-viewed';
import Sort from '@/components/sort';
import StandaloneSearchBox from '@/components/standalone-search-box';
import Summary from '@/components/summary';
import {
  listingEngineDefinition,
  recommendationEngineDefinition,
} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';

// This is a hardcoded list of categories that are available in my coveo merchandising hub.
const categoryList = ['surf-accessories', 'paddleboards', 'toys'];
/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing({params}: {params: {category: string}}) {
  const {category} = params;

  const matchedCategory = categoryList.find((c) => c === category);

  if (!matchedCategory) {
    notFound();
  }

  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await listingEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      // TODO: should not require definition with recommendation = true
      // popularBought: {
      //   slotId: 'SHOULD NOT BE THERE',
      //   productId: 'SHOULD NOT BE THEREX',
      // },
      // popularViewed: {
      //   slotId: 'SHOULD NOT BE THERE',
      //   productId: 'SHOULD NOT BE THEREX',
      // },
      // popularBoughtDisabled: {
      //   // TODO: should not be required if enabled set to false
      //   slotId: 'SHOULD NOT BE THERE',
      //   productId: 'SHOULD NOT BE THEREX',
      // },
      context: {
        language: defaultContext.language,
        country: defaultContext.country,
        currency: defaultContext.currency,
        view: {
          url: `https://sports.barca.group/browse/promotions/${matchedCategory}`,
        },
      },
    },
  });

  const recsStaticState =
    await // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recommendationEngineDefinition.fetchStaticState({
      controllers: {
        popularBought: {
          slotId: 'SHOULD NOT BE THERE',
          productId: 'SHOULD NOT BE THEREX',
        },
        popularViewed: {
          slotId: 'SHOULD NOT BE THERE',
          productId: 'SHOULD NOT BE THEREX',
        },
        popularBoughtDisabled: {
          // TODO: should not be required if enabled set to false
          slotId: 'SHOULD NOT BE THERE',
          productId: 'SHOULD NOT BE THEREX',
        },
        cart: {initialState: {items}},
        context: {
          language: defaultContext.language,
          country: defaultContext.country,
          currency: defaultContext.currency,
          view: {
            url: `https://sports.barca.group/browse/promotions/${matchedCategory}`,
          },
        },
      },
    });

  return (
    <ListingProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
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
          <RecommendationProvider
            staticState={recsStaticState}
            navigatorContext={navigatorContext.marshal}
          >
            <PopularBought />
            <PopularViewed />
          </RecommendationProvider>
        </div>
      </div>
    </ListingProvider>
  );
}

export const dynamic = 'force-dynamic';
