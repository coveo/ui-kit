import externalCartAPI, {ExternalCartItem} from '@/client/external-cart-api';
import externalContextAPI from '@/client/external-context-api';
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
import Cart from '../components/cart';
import {StandaloneProvider} from '../components/providers/providers';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const navigatorContext = await getNavigatorContext(request);

  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  const items = await externalCartAPI.getItems();
  const totalPrice = await externalCartAPI.getTotalPrice();
  const {country, currency, language} =
    await externalContextAPI.getContextInformation();

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
      //parameterManager: {initialState: {parameters: {}}},
    },
  });

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
      <Cart
        items={items}
        totalPrice={totalPrice}
        language={language}
        currency={currency}
      />
    </StandaloneProvider>
  );
}
