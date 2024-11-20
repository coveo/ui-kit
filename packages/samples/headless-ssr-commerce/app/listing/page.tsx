import BreadcrumbManager from '@/components/breadcrumb-manager';
import Cart from '@/components/cart';
import FacetGenerator from '@/components/facets/facet-generator';
import Pagination from '@/components/pagination';
import ParameterManager from '@/components/parameter-manager';
import ProductList from '@/components/product-list';
import ListingProvider from '@/components/providers/listing-provider';
import {Recommendations} from '@/components/recommendation-list';
import Sort from '@/components/sort';
import StandaloneSearchBox from '@/components/standalone-search-box';
import Summary from '@/components/summary';
import {listingEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {symmetricDifference} from '@/utils/set';
import {
  buildSSRCommerceSearchParameterSerializer,
  CommerceSearchParameters,
} from '@coveo/headless-react/ssr-commerce';
import {revalidateTag, unstable_cache} from 'next/cache';
import {cookies, headers} from 'next/headers';
import {unstable_after} from 'next/server';

const getSearchEngineDefinition = unstable_cache(
  (cachedParameters: CommerceSearchParameters) =>
    listingEngineDefinition.fetchStaticState({
      controllers: {
        parameterManager: {initialState: {parameters: cachedParameters}},
      },
    }),
  undefined,
  {revalidate: 5, tags: ['listing']}
);

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing({
  searchParams,
}: {
  searchParams: Promise<URLSearchParams>;
}) {
  const headersList = await headers();
  const cookieStore = await cookies();

  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headersList);
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {serialize, toCommerceSearchParameters} =
    buildSSRCommerceSearchParameterSerializer();
  const parameters = toCommerceSearchParameters(await searchParams);

  let cachedParameters = parameters;
  let shouldInvalidate = false;
  if (cookieStore.has('searchParamCache')) {
    const cachedParams = cookieStore.get('searchParamCache')!.value;
    const decryptedParams = JSON.parse(atob(cachedParams));
    const decryptedSearchParams = (
      decryptedParams.state as Awaited<
        ReturnType<typeof listingEngineDefinition.fetchStaticState>
      >['controllers']['parameterManager']['state']
    ).parameters;
    const cachedOriginalParams = decryptedParams.cachedParams;
    const cachedParamsSet = new Set(
      new URL(
        serialize(decryptedSearchParams, new URL('https://www.example.com'))
      ).search.split('&')
    );
    const currentParamsSet = new Set(
      new URL(
        serialize(parameters, new URL('https://www.example.com'))
      ).search.split('&')
    );
    if (symmetricDifference(cachedParamsSet, currentParamsSet).size === 0) {
      console.log('PARAMS MATCH');
      cachedParameters = cachedOriginalParams;
      shouldInvalidate = true;
    } else {
      console.log('PARAMS DONT MATCH');
    }
  }
  const staticState = await getSearchEngineDefinition(cachedParameters);
  if (shouldInvalidate) {
    unstable_after(() => {
      revalidateTag('listing');
    });
  }

  console.log(
    'FETCHED STATIC STATE',
    staticState.controllers.summary.state.searchuid
  );

  const url = headersList.get('x-coveo-href')!;

  return (
    <ListingProvider
      staticState={staticState}
      searchParams={parameters}
      navigatorContext={navigatorContext.marshal}
    >
      <ParameterManager initialUrl={url} />
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <FacetGenerator />
        </div>

        <div style={{flex: 2}}>
          <StandaloneSearchBox />
          <BreadcrumbManager />
          <Summary />
          <Sort />
          <ProductList />
          {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
          <Pagination />
          {/* <ShowMore
            staticState={staticState.controllers.pagination.state}
            controller={hydratedState?.controllers.pagination}
            summaryController={hydratedState?.controllers.summary}
          /> */}
        </div>

        <div style={{flex: 3}}>
          <h3>My Cart</h3>
          <Cart />
        </div>

        <div style={{flex: 4}}>
          <Recommendations />
        </div>
      </div>
    </ListingProvider>
  );
}

export const dynamic = 'force-dynamic';
