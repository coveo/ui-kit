import ContextDropdown from '@/app/components/context-dropdown';
import ProductView from '@/app/components/product-view';
import {StandaloneProvider} from '@/app/components/providers/providers';
import StandaloneSearchBox from '@/app/components/standalone-search-box';
import externalCartService, {
  ExternalCartItem,
} from '@/external-services/external-cart-service';
import externalCatalogAPI, {
  ExternalCatalogItem,
} from '@/external-services/external-catalog-service';
import externalContextService from '@/external-services/external-context-service';
import {
  standaloneEngineDefinition,
  StandaloneStaticState,
} from '@/lib/commerce-engine';
import {fetchToken} from '@/lib/fetch-token';
import {isExpired} from '@/lib/jwt-utils';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  toCoveoCartItems,
  toCoveoCurrency,
} from '@/utils/external-api-conversions';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {coveo_accessToken} from '../cookies.server';
import useClientId from '../hooks/use-client-id';

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  const productId = params.productId;

  invariant(productId, 'Missing productId parameter');

  const catalogItem = await externalCatalogAPI.getItem(request.url);

  const {country, currency, language} =
    await externalContextService.getContextInformation();

  const {navigatorContext, setCookieHeader} =
    await getNavigatorContext(request);

  if (isExpired(standaloneEngineDefinition.getAccessToken())) {
    const accessTokenCookie = await coveo_accessToken.parse(
      request.headers.get('Cookie')
    );

    const accessToken = isExpired(accessTokenCookie)
      ? await fetchToken()
      : accessTokenCookie;

    standaloneEngineDefinition.setAccessToken(accessToken);
  }

  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  const staticState = await standaloneEngineDefinition.fetchStaticState({
    controllers: {
      cart: {
        initialState: {
          items: toCoveoCartItems(await externalCartService.getItems()),
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
    },
  });

  const cartItem = await externalCartService.getItem(productId);

  return Response.json(
    {
      staticState,
      navigatorContext,
      catalogItem,
      cartItem,
      language,
      currency,
    },
    {headers: {...setCookieHeader}}
  );
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

  useClientId();

  return (
    <StandaloneProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <ContextDropdown />
      <StandaloneSearchBox />
      <ProductView
        catalogItem={catalogItem}
        cartItem={cartItem}
        language={language}
        currency={currency}
      />
    </StandaloneProvider>
  );
}
