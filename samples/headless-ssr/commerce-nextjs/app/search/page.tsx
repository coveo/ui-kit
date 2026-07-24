import {buildParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {headers} from 'next/headers';
import * as externalCartAPI from '@/actions/external-cart-api';
import BreadcrumbManager from '@/components/breadcrumb-manager';
import DidYouMean from '@/components/did-you-mean';
import FacetGenerator from '@/components/facets/facet-generator';
import Pagination from '@/components/pagination';
import ParameterManager from '@/components/parameter-manager';
import ProductList from '@/components/product-list';
import {SearchProvider} from '@/components/providers/providers';
import SearchBox from '@/components/search-box';
import Sort from '@/components/sort';
import Summary from '@/components/summary';
import {searchEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {defaultContext} from '@/utils/context';

export default async function Search({searchParams}: {searchParams: Promise<URLSearchParams>}) {
  // Set the navigator context provider before fetching the app static state.
  const navigatorContext = new NextJsNavigatorContext(await headers());
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(await searchParams);

  // Fetch the cart items from the external service.
  const items = await externalCartAPI.getCart();

  // Fetch the static state of the app with its initial state.
  const staticState = await searchEngineDefinition.fetchStaticState({
    controllers: {
      cart: {initialState: {items}},
      context: {
        language: defaultContext.language,
        country: defaultContext.country,
        currency: defaultContext.currency,
        view: {
          url: 'https://sports.barca.group/search',
        },
      },
      parameterManager: {initialState: {parameters}},
    },
  });

  return (
    <SearchProvider staticState={staticState} navigatorContext={navigatorContext.marshal}>
      <ParameterManager url={navigatorContext.location} />
      <SearchBox />
      <DidYouMean />
      <div className="PageLayout">
        <aside className="Sidebar">
          <FacetGenerator />
        </aside>
        <div className="Results">
          <div className="Toolbar">
            <Summary />
            <Sort />
          </div>
          <BreadcrumbManager />
          <ProductList />
          <Pagination />
        </div>
      </div>
    </SearchProvider>
  );
}

export const dynamic = 'force-dynamic';
