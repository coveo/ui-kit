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
import {headers} from 'next/headers';

export default async function Search() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      popularBought: {}, // TODO:: KIT-3782: should not be required on listing engine definition
      popularViewed: {}, // TODO:: KIT-3782: should not be required on listing engine definition
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
    {
      controllers: {
        popularBought: {}, // TODO: KIT-3782: should be optional
        popularViewed: {}, // TODO: KIT-3782: should be optional
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
    }
  );
  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <ContextDropdown />
        <StandaloneSearchBox />
        <Cart />
        <RecommendationProvider
          staticState={recsStaticState}
          navigatorContext={navigatorContext.marshal}
        >
          <PopularBought />
        </RecommendationProvider>
      </div>
    </StandaloneProvider>
  );
}

export const dynamic = 'force-dynamic';
