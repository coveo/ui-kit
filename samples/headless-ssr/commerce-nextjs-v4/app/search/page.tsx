import {
  buildParameterSerializer,
  type ContextOptions,
} from '@coveo/headless-react/ssr-commerce-next';
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
import {getNavigatorContext} from '@/lib/navigator-context';
import {defaultContext} from '@/utils/context';

export default async function Search({searchParams}: {searchParams: Promise<URLSearchParams>}) {
  // The navigator context describes the visitor's browser. It is passed to every `fetchStaticState` call.
  const navigatorContext = await getNavigatorContext();

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
    navigatorContext,
    searchParams: parameters,
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
            {/* The listing pages use Pagination instead: the two components showcase two frequent ways to implement pagination. */}
            <ShowMore />
          </div>
        </div>
      </SearchProvider>
    </>
  );
}

export const dynamic = 'force-dynamic';
