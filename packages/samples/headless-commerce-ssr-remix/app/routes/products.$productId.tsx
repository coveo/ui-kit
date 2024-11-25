import externalCartAPI, {ExternalCartItem} from '@/client/external-cart-api';
import externalCatalogAPI, {
  ExternalCatalogItem,
} from '@/client/external-catalog-api';
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
import invariant from 'tiny-invariant';
import ProductView from '../components/product-view';
import StandaloneProvider from '../components/providers/standalone-provider';

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  const productId = params.productId;

  invariant(productId, 'Missing productId parameter');

  const catalogItem = await externalCatalogAPI.getItem(request.url);

  const {country, currency, language} =
    await externalContextAPI.getContextInformation();

  const navigatorContext = await getNavigatorContext(request);

  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {
      cart: {
        initialState: {
          items: toCoveoCartItems(await externalCartAPI.getItems()),
        },
      },
      context: {
        language,
        country,
        currency: toCoveoCurrency(currency),
        view: {
          url: `https://sports.barca.group/products/${productId}`,
        },
      },
      parameterManager: {initialState: {parameters: {}}},
    },
  });

  const cartItem = await externalCartAPI.getItem(productId);

  return {
    staticState,
    navigatorContext,
    catalogItem,
    cartItem,
    language,
    currency,
  };
};

export default function ProductRoute() {
  const {
    staticState,
    navigatorContext,
    catalogItem,
    cartItem,
    language,
    currency,
  } = useLoaderData<{
    staticState: StandaloneStaticState;
    navigatorContext: NavigatorContext;
    productId: string;
    catalogItem: ExternalCatalogItem;
    cartItem: ExternalCartItem | null;
    language: string;
    currency: string;
  }>();

  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <ProductView
        catalogItem={catalogItem}
        cartItem={cartItem}
        language={language}
        currency={currency}
      />
    </StandaloneProvider>
  );
}
