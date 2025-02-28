import BreadcrumbManager from '@/app/components/breadcrumb-manager';
import ContextDropdown from '@/app/components/context-dropdown';
import DidYouMean from '@/app/components/did-you-mean';
import FacetGenerator from '@/app/components/facets/facet-generator';
import ParameterManager from '@/app/components/parameter-manager';
import ProductList from '@/app/components/product-list';
import {SearchProvider} from '@/app/components/providers/providers';
import SearchBox from '@/app/components/search-box';
import ShowMore from '@/app/components/show-more';
import Sort from '@/app/components/sort';
import Summary from '@/app/components/summary';
import Triggers from '@/app/components/triggers/triggers';
import externalCartService from '@/external-services/external-cart-service';
import externalContextService from '@/external-services/external-context-service';
import {searchEngineDefinition, SearchStaticState} from '@/lib/commerce-engine';
import {fetchToken} from '@/lib/fetch-token';
import {isExpired} from '@/lib/jwt-utils';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  toCoveoCartItems,
  toCoveoCurrency,
} from '@/utils/external-api-conversions';
import {
  buildParameterSerializer,
  NavigatorContext,
} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {coveo_accessToken} from '../cookies.server';
import useClientId from '../hooks/use-client-id';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {navigatorContext, setCookieHeader} =
    await getNavigatorContext(request);

  const url = new URL(request.url);

  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(url.searchParams);

  if (isExpired(searchEngineDefinition.getAccessToken())) {
    const accessTokenCookie = await coveo_accessToken.parse(
      request.headers.get('Cookie')
    );

    const accessToken = isExpired(accessTokenCookie)
      ? await fetchToken()
      : accessTokenCookie;

    searchEngineDefinition.setAccessToken(accessToken);
  }

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
      parameterManager: {
        initialState: {
          parameters: parameters,
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

  return Response.json(
    {
      staticState,
      navigatorContext,
    },
    {headers: {...setCookieHeader}}
  );
};

export default function SearchRoute() {
  const {staticState, navigatorContext} = useLoaderData<{
    staticState: SearchStaticState;
    navigatorContext: NavigatorContext;
  }>();

  useClientId();

  return (
    <SearchProvider
      staticState={staticState}
      navigatorContext={navigatorContext}
    >
      <ParameterManager url={navigatorContext.location} />
      <h2>Search</h2>
      <ContextDropdown useCase="search" />
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <FacetGenerator />
        </div>
        <div style={{flex: 2}}>
          <Triggers />
          <SearchBox />
          <DidYouMean />
          <BreadcrumbManager />
          <Summary />
          <Sort />
          <ProductList />

          {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
          {/* <Pagination
          staticState={staticState.controllers.pagination.state}
          controller={hydratedState?.controllers.pagination}
        ></Pagination> */}
          <ShowMore />
        </div>
      </div>
    </SearchProvider>
  );
}
