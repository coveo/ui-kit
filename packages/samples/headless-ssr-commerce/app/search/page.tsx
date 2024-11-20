import BreadcrumbManager from '@/components/breadcrumb-manager';
import FacetGenerator from '@/components/facets/facet-generator';
import ParameterManager from '@/components/parameter-manager';
import ProductList from '@/components/product-list';
import SearchProvider from '@/components/providers/search-provider';
import {Recommendations} from '@/components/recommendation-list';
import SearchBox from '@/components/search-box';
import ShowMore from '@/components/show-more';
import Summary from '@/components/summary';
import Triggers from '@/components/triggers/triggers';
import {searchEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {symmetricDifference} from '@/utils/set';
import {
  buildSSRCommerceSearchParameterSerializer,
  CommerceSearchParameters,
} from '@coveo/headless-react/ssr-commerce';
import {revalidateTag, unstable_cache} from 'next/cache';
import {headers, cookies} from 'next/headers';

const getSearchEngineDefinition = unstable_cache(
  (cachedParameters: CommerceSearchParameters) =>
    searchEngineDefinition.fetchStaticState({
      controllers: {
        parameterManager: {initialState: {parameters: cachedParameters}},
      },
    }),
  undefined,
  {revalidate: 5, tags: ['search']}
);

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<URLSearchParams>;
}) {
  const headersList = headers();
  const cookieStore = cookies();
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headersList);
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

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
        ReturnType<typeof searchEngineDefinition.fetchStaticState>
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
    revalidateTag('search');
  }
  console.log(
    'FETCHED STATIC STATE',
    staticState.controllers.summary.state.searchuid
  );

  const url = headersList.get('x-coveo-href')!;

  return (
    <SearchProvider
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
          <Triggers />
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

        <div style={{flex: 3}}>
          {/* popularBoughtRecs */}
          {/* TODO: KIT-3503: need to revisit the way recommendations are added*/}
          <Recommendations />
        </div>
      </div>
    </SearchProvider>
  );
}

// export const dynamic = 'force-dynamic';
