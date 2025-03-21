import Cart from '@/app/components/cart';
import ContextDropdown from '@/app/components/context-dropdown';
import {
  RecommendationProvider,
  StandaloneProvider,
} from '@/app/components/providers/providers';
import PopularRecommendations from '@/app/components/recommendations/popular-recommendations';
import StandaloneSearchBox from '@/app/components/standalone-search-box';
import externalCartService, {
  ExternalCartItem,
} from '@/external-services/external-cart-service';
import externalContextService from '@/external-services/external-context-service';
import {
  recommendationEngineDefinition,
  RecommendationStaticState,
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
import {coveo_accessToken} from '../cookies.server';
import useClientId from '../hooks/use-client-id';

export const loader = async ({request}: LoaderFunctionArgs) => {
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

  const recsStaticState = await recommendationEngineDefinition.fetchStaticState(
    {
      controllers: {
        popularViewedRecs: {enabled: true},
        popularBoughtRecs: {enabled: true},
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
            url: 'https://sports.barca.group/cart',
          },
        },
      },
    }
  );

  return Response.json(
    {
      staticState,
      items,
      totalPrice,
      language,
      currency,
      recsStaticState,
    },
    {headers: {...setCookieHeader}}
  );
};

export default function CartRoute() {
  const {
    staticState,
    navigatorContext,
    items,
    totalPrice,
    language,
    currency,
    recsStaticState,
  } = useLoaderData<{
    staticState: StandaloneStaticState;
    navigatorContext: NavigatorContext;
    items: ExternalCartItem[];
    totalPrice: number;
    language: string;
    currency: string;
    recsStaticState: RecommendationStaticState;
  }>();

  useClientId();

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
        <RecommendationProvider
          staticState={recsStaticState}
          navigatorContext={navigatorContext}
        >
          <PopularRecommendations type="bought" />
        </RecommendationProvider>
      </div>
    </StandaloneProvider>
  );
}
