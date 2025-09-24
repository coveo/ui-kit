import {
  buildParameterSerializer,
  type ContextOptions,
} from '@coveo/headless-react/ssr-commerce-next';
import {headers} from 'next/headers';
import * as externalCartAPI from '@/actions/external-cart-api';
import BreadcrumbManager from '@/components/breadcrumb-manager';
import ContextDropdown from '@/components/context-dropdown';
import DidYouMean from '@/components/did-you-mean';
import FacetGenerator from '@/components/facets/facet-generator';
import ParameterManager from '@/components/parameter-manager';
import ProductList from '@/components/product-list';
import {SearchProvider} from '@/components/providers/providers';
import SearchBox from '@/components/search-box';
import ShowMore from '@/components/show-more';
import Summary from '@/components/summary';
import NotifyTrigger from '@/components/triggers/notify-trigger';
import QueryTrigger from '@/components/triggers/query-trigger';
import {searchEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<URLSearchParams>;
}) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(await headers());

  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(await searchParams);

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Define the context options for listing and recommendations
  const context: ContextOptions = {
    language: defaultContext.language,
    country: defaultContext.country,
    currency: defaultContext.currency,
    view: {
      url: 'https://sports.barca.group/search',
    },
  };

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await searchEngineDefinition.fetchStaticState({
    cart: {items},
    context,
    navigatorContext: navigatorContext.marshal,
    searchParams: {
      ...parameters,
      // TODO: this is bad DX! Need to use the same parameter as the parameterSerializer to avoid this hack
      query: parameters.q || '',
    },
  });

  return (
    <>
      <h2>Search</h2>

      <SearchProvider staticState={staticState}>
        <ParameterManager url={navigatorContext.location} />
        <DidYouMean />
        <NotifyTrigger />
        <QueryTrigger />
        <ContextDropdown useCase="search" />
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{flex: 1}}>
            <FacetGenerator />
          </div>
          <div style={{flex: 2}}>
            <SearchBox />
            <BreadcrumbManager />
            <Summary />
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
    </>
  );
}

export const dynamic = 'force-dynamic';
