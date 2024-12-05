import externalCartAPI from '@/client/external-cart-api';
import externalContextAPI from '@/client/external-context-api';
import {
  listingEngineDefinition,
  ListingStaticState,
} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  toCoveoCartItems,
  toCoveoCurrency,
} from '@/utils/external-api-conversions';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, useParams} from '@remix-run/react';
import invariant from 'tiny-invariant';
import ProductList from '../components/product-list';
import {ListingProvider} from '../components/providers/providers';
import {coveo_visitorId} from '../cookies.server';

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  invariant(params.listingId, 'Missing listingId parameter');

  const navigatorContext = await getNavigatorContext(request);

  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {country, currency, language} =
    await externalContextAPI.getContextInformation();

  const staticState = await listingEngineDefinition.fetchStaticState({
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
          url: `https://sports.barca.group/browse/promotions/${params.listingId}`,
        },
      },
      //parameterManager: {initialState: {parameters: {}}},
    },
  });

  return {
    staticState,
    navigatorContext,
    headers: {
      'Set-Cookie': await coveo_visitorId.serialize(navigatorContext.clientId),
    },
  };
};

export default function ListingRoute() {
  const params = useParams();
  const {staticState, navigatorContext} = useLoaderData<{
    staticState: ListingStaticState;
    navigatorContext: NavigatorContext;
  }>();

  const getTitle = () => {
    return params.listingId
      ?.split('-')
      .map(
        (subString) => subString.charAt(0).toUpperCase() + subString.slice(1)
      )
      .join(' ');
  };

  return (
    <ListingProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <h2>{getTitle()}</h2>
      <ProductList />
    </ListingProvider>
  );
}
