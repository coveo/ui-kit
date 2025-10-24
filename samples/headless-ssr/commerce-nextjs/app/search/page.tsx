import {buildParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {headers} from 'next/headers';
import * as externalCartAPI from '@/actions/external-cart-api';
import BreadcrumbManager from '@/components/breadcrumb-manager';
import ContextDropdown from '@/components/context-dropdown';
import DidYouMean from '@/components/did-you-mean';
import FacetGenerator from '@/components/facets/facet-generator';
import ParameterManager from '@/components/parameter-manager';
import ProductList from '@/components/product-list';
import {AvailabilityProvider} from '@/components/providers/availability-provider';
import {SearchProvider} from '@/components/providers/providers';
import SearchBox from '@/components/search-box';
import ShowMore from '@/components/show-more';
import Summary from '@/components/summary';
import NotifyTrigger from '@/components/triggers/notify-trigger';
import QueryTrigger from '@/components/triggers/query-trigger';
import {searchEngineDefinition} from '@/lib/commerce-engine';
import {NextJsNavigatorContext} from '@/lib/navigatorContextProvider';
import {
  type Availability,
  fetchAvailability,
} from '@/lib/third-party-api-provider';
import {defaultContext} from '@/utils/context';

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<URLSearchParams>;
}) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(await headers());
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {deserialize} = buildParameterSerializer();
  const parameters = deserialize(await searchParams);

  // Fetches the cart items from an external service
  const items = await externalCartAPI.getCart();

  // Fetches the static state of the app with initial state (when applicable)
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

  /**
   * We elect to not block the rendering of the data of the system that handles our stock.
   * Instead:
   *   - We do enqueue all requests
   *   - We "race them" against a 600ms dummy promise after_
   * The latter represent the "budget" we allocate to the fake system before we continue on the rendering.
   * When we do, future resolved values will be passed along using Suspense & Streaming.
   */

  // The map is provided later on as a context as it will be used by our "suspensed" availability UI component
  const productIdToAvailabilityRequests = new Map<
    string,
    Promise<Availability>
  >();

  // For each product, we enqueue the request and set it in the map we'll provide as context.
  for (const product of staticState.controllers.productList.state.products) {
    if (!product.ec_product_id) {
      continue;
    }
    productIdToAvailabilityRequests.set(
      product.ec_product_id,
      fetchAvailability(product.ec_product_id)
    );
  }

  // Then, we wait up to 600ms or for all requests to resolves. Any resolved request by the end of the 600ms will be usable during the initial rendering
  // This is mostly done for demo purposes of the streaming process, and arbitrary delay such as this should _probably_ not be used in production implementation
  await Promise.race([
    Promise.allSettled(productIdToAvailabilityRequests.values()),
    new Promise((resolve) => setTimeout(resolve, 600)),
  ]);
  return (
    <>
      <h2>Search</h2>

      <SearchProvider
        staticState={staticState}
        navigatorContext={navigatorContext.marshal}
      >
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
            <AvailabilityProvider
              productIdToAvailabilityRequests={productIdToAvailabilityRequests}
            >
              <ProductList />
            </AvailabilityProvider>
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
