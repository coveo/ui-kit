import externalCartService from '@/external-services/external-cart-service';
import externalContextService from '@/external-services/external-context-service';
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
import {SearchProvider} from '../components/providers/providers';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const navigatorContext = await getNavigatorContext(request);

  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {country, currency, language} =
    await externalContextService.getContextInformation();

  const staticState = await searchEngineDefinition.fetchStaticState({
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
          url: `https://sports.barca.group/search`,
        },
      },
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
