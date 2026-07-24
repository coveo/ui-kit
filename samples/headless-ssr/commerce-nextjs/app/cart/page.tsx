import {headers} from 'next/headers';
import * as externalCartAPI from '@/actions/external-cart-api';
import Cart from '@/components/cart';
import {RecommendationProvider, StandaloneProvider} from '@/components/providers/providers';
import PopularBought from '@/components/recommendations/popular-bought';
import StandaloneSearchBox from '@/components/standalone-search-box';
import {recommendationEngineDefinition, standaloneEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

export default async function CartPage() {
  // Set the navigator context provider before fetching the app static state.
  const navigatorContext = new NextJsNavigatorContext(await headers());
  standaloneEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetch the cart items from the external service.
  const items = await externalCartAPI.getCart();

  const staticState = await standaloneEngineDefinition.fetchStaticState({
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

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState({
    controllers: {
      popularBought: {enabled: true},
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

  return (
    <StandaloneProvider staticState={staticState} navigatorContext={navigatorContext.marshal}>
      <StandaloneSearchBox />
      <h2>Cart</h2>
      <Cart />
      <RecommendationProvider
        staticState={recsStaticState}
        navigatorContext={navigatorContext.marshal}
      >
        <section className="Recommendations">
          <PopularBought />
        </section>
      </RecommendationProvider>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
