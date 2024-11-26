import * as externalCartAPI from '@/actions/external-cart-api';
import Cart from '@/components/cart';
import ContextDropdown from '@/components/context-dropdown';
import RecommendationProvider from '@/components/providers/recommendation-provider';
import SearchProvider from '@/components/providers/search-provider';
import PopularBought from '@/components/recommendations/popular-bought';
import {
  recommendationEngineDefinition,
  searchEngineDefinition,
} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';
import {headers} from 'next/headers';

export default async function Search() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await searchEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      context: {
        language: defaultContext.language,
        country: defaultContext.country,
        currency: defaultContext.currency,
        view: {
          url: 'https://sports.barca.group/cart',
        },
      },
    },
  });

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    ['popularBought']
  );
  return (
    <SearchProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <ContextDropdown />
        <Cart />
        <RecommendationProvider
          staticState={recsStaticState}
          navigatorContext={navigatorContext.marshal}
        >
          <PopularBought />
        </RecommendationProvider>
      </div>
    </SearchProvider>
  );
}

export const dynamic = 'force-dynamic';
