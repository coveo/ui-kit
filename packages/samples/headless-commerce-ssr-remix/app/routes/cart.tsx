import Cart from '@/app/components/cart';
import ContextDropdown from '@/app/components/context-dropdown';
import {StandaloneProvider} from '@/app/components/providers/providers';
import StandaloneSearchBox from '@/app/components/standalone-search-box';
import externalCartService, {
  ExternalCartItem,
} from '@/external-services/external-cart-service';
import externalContextService from '@/external-services/external-context-service';
import {
  standaloneEngineDefinition,
  StandaloneStaticState,
} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  toCoveoCartItems,
  toCoveoCurrency,
} from '@/utils/external-api-conversions';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const navigatorContext = await getNavigatorContext(request);

  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  const items = await externalCartService.getItems();
  const totalPrice = await externalCartService.getTotalPrice();
  const {country, currency, language} =
    await externalContextService.getContextInformation();

  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {
      cart: {
        initialState: {
          items: toCoveoCartItems(items),
        },
      },
      context: {
        language,
        country,
        currency: toCoveoCurrency(currency),
        view: {
          url: `https://sports.barca.group/cart`,
        },
      },
    },
  });

  /* const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    ['popularBoughtRecs', 'popularViewedRecs']
  );
   */
  return {staticState, items, totalPrice, language, currency};
};

export default function CartRoute() {
  const {staticState, navigatorContext, items, totalPrice, language, currency} =
    useLoaderData<{
      staticState: StandaloneStaticState;
      navigatorContext: NavigatorContext;
      items: ExternalCartItem[];
      totalPrice: number;
      language: string;
      currency: string;
    }>();
  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <h2>Cart</h2>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <ContextDropdown />
        <StandaloneSearchBox />
        <Cart
          items={items}
          totalPrice={totalPrice}
          language={language}
          currency={currency}
        />
        {/*         <RecommendationProvider
          staticState={recsStaticState}
          navigatorContext={navigatorContext}
        >
          <PopularBought />
        </RecommendationProvider> */}
      </div>
    </StandaloneProvider>
  );
}
