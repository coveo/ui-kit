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
import {buildSSRCommerceSearchParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {headers} from 'next/headers';

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<URLSearchParams>;
}) {
  const headersList = await headers();
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headersList);
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {toCommerceSearchParameters} =
    buildSSRCommerceSearchParameterSerializer();
  const parameters = toCommerceSearchParameters(await searchParams);

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await searchEngineDefinition.fetchStaticState({
    controllers: {parameterManager: {initialState: {parameters}}},
  });

  console.log(
    'FETCHED STATIC STATE',
    staticState.controllers.summary.state.searchuid
  );

  const url = headersList.get('x-coveo-href')!;

  return (
    <SearchProvider
      staticState={staticState}
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

export const dynamic = 'force-dynamic';
