import externalCartAPI from '@/client/external-cart-api';
import externalContextAPI from '@/client/external-context-api';
import {searchEngineDefinition, SearchStaticState} from '@/lib/commerce-engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  toCoveoCartItems,
  toCoveoCurrency,
} from '@/utils/external-api-conversions';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import ProductList from '../components/product-list';
import SearchProvider from '../components/providers/search-provider';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const navigatorContext = await getNavigatorContext(request);

  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {country, currency, language} =
    await externalContextAPI.getContextInformation();

  const staticState = await searchEngineDefinition.fetchStaticState({
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
          url: `https://sports.barca.group/search`,
        },
      },
      parameterManager: {initialState: {parameters: {}}},
    },
  });

  return {staticState, navigatorContext};
};

export default function SearchRoute() {
  const {staticState, navigatorContext} = useLoaderData<{
    staticState: SearchStaticState;
    navigatorContext: NavigatorContext;
  }>();
  return (
    <SearchProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <h2>Search</h2>
      <ProductList />
    </SearchProvider>
  );
}
