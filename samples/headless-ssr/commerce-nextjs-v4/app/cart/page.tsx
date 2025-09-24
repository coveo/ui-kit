import type {ContextOptions} from '@coveo/headless-react/ssr-commerce-next';
import {headers} from 'next/headers';
import * as externalCartAPI from '@/actions/external-cart-api';
import Cart from '@/components/cart';
import ContextDropdown from '@/components/context-dropdown';
import {
  RecommendationProvider,
  StandaloneProvider,
} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {
  recommendationEngineDefinition,
  standaloneEngineDefinition,
} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

export default async function Search() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(await headers());

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Define the context options for listing and recommendations
  const context: ContextOptions = {
    language: defaultContext.language,
    country: defaultContext.country,
    currency: defaultContext.currency,
    view: {
      url: 'https://sports.barca.group/cart',
    },
  };

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext: navigatorContext.marshal,
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
    <StandaloneProvider staticState={staticState}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <ContextDropdown />
        <StandaloneSearchBox />
        <Cart />
        <RecommendationProvider staticState={recsStaticState}>
          <PopularBought />
        </RecommendationProvider>
      </div>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
